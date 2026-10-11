// Server-only: scans the content folder and builds the catalogue.
// Video files are never exposed as plain /public URLs. The browser only ever
// receives short-lived signed links to /api/stream/<id> (see app/api/stream).
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { contentDir, seriesInfo } from "@/data/catalogue";

const VIDEO = { ".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime" };
const IMAGE = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const LINK_TTL = 12 * 60 * 60; // signed links live for 12 hours
const SKIP = new Set(["node_modules", ".next", ".git", "public", "app", "components", "data", "lib"]);

const ext = (f) => path.extname(f).toLowerCase();
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const pretty = (name) => {
  const t = name.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return /[A-Z]/.test(t) ? t : t.replace(/\b\p{L}/gu, (c) => c.toUpperCase()); // "house of thieves" -> "House Of Thieves"
};
const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "title";
const hashId = (rel) => crypto.createHash("sha256").update(rel).digest("hex").slice(0, 20);
const isTrailer = (name) => /trailer|teaser|promo/i.test(name);

// --- where the videos live --------------------------------------------------
export function resolveContentDir() {
  const root = process.cwd();
  const wanted = path.join(root, contentDir);
  if (fs.existsSync(wanted)) return wanted;
  // Fallback: any top-level folder that contains an "Md" folder (folder got renamed, etc.)
  try {
    for (const d of fs.readdirSync(root, { withFileTypes: true })) {
      if (!d.isDirectory() || SKIP.has(d.name) || d.name.startsWith(".")) continue;
      const inner = fs.readdirSync(path.join(root, d.name), { withFileTypes: true });
      const md = inner.find((x) => x.isDirectory() && x.name.toLowerCase() === "md");
      if (md) return path.join(root, d.name, md.name);
    }
  } catch {}
  return wanted;
}

// --- link signing -----------------------------------------------------------
function secret() {
  if (process.env.STREAM_SECRET) return process.env.STREAM_SECRET;
  if (globalThis.__bosSecret) return globalThis.__bosSecret;
  const file = path.join(process.cwd(), ".stream-secret"); // local dev: created once, git-ignored
  let s;
  try {
    s = fs.readFileSync(file, "utf8").trim();
  } catch {}
  if (!s) {
    s = crypto.randomBytes(32).toString("hex");
    try {
      fs.writeFileSync(file, s);
    } catch {}
  }
  globalThis.__bosSecret = s;
  return s;
}
const sign = (id, exp) => crypto.createHmac("sha256", secret()).update(`${id}.${exp}`).digest("base64url").slice(0, 32);

function signedUrl(id) {
  const exp = Math.floor(Date.now() / 1000) + LINK_TTL;
  return `/api/stream/${id}?e=${exp}&s=${sign(id, exp)}`;
}

export function verifyLink(id, exp, sig) {
  if (!id || !exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const good = Buffer.from(sign(id, exp));
  const got = Buffer.from(String(sig));
  return good.length === got.length && crypto.timingSafeEqual(good, got);
}

// --- folder scan ------------------------------------------------------------
function walk(dir, base = "") {
  let out = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name.startsWith(".")) continue;
    const rel = base ? `${base}/${d.name}` : d.name;
    if (d.isDirectory()) out = out.concat(walk(path.join(dir, d.name), rel));
    else if (d.isFile()) out.push(rel);
  }
  return out;
}

function scan() {
  const root = resolveContentDir();
  const files = new Map(); // id -> { abs, kind, mime }
  const groups = []; // { key, items: [relative paths] }
  if (!fs.existsSync(root)) return { root, files, groups, missing: true };

  const add = (rel) => {
    const e = ext(rel);
    const id = hashId(rel);
    files.set(id, { abs: path.join(root, rel), kind: VIDEO[e] ? "video" : "image", mime: VIDEO[e] || IMAGE[e] });
    return id;
  };

  const top = fs.readdirSync(root, { withFileTypes: true }).filter((d) => !d.name.startsWith("."));
  for (const d of top.sort((a, b) => natural(a.name, b.name))) {
    if (d.isDirectory()) {
      const all = walk(path.join(root, d.name)).map((r) => `${d.name}/${r}`);
      const vids = all.filter((r) => VIDEO[ext(r)]).sort(natural);
      if (!vids.length) continue;
      const img = all.filter((r) => IMAGE[ext(r)]).sort(natural);
      const poster = img.find((r) => /poster|cover|thumb/i.test(path.basename(r))) || img[0];
      groups.push({ key: d.name, vids: vids.map((r) => ({ rel: r, id: add(r) })), poster: poster ? add(poster) : null });
    } else if (d.isFile() && VIDEO[ext(d.name)]) {
      const stem = path.basename(d.name, path.extname(d.name));
      const img = top.find((x) => x.isFile() && IMAGE[ext(x.name)] && path.basename(x.name, path.extname(x.name)) === stem);
      groups.push({ key: stem, single: true, vids: [{ rel: d.name, id: add(d.name) }], poster: img ? add(img.name) : null });
    }
  }
  return { root, files, groups, missing: false };
}

function cached() {
  const c = globalThis.__bosScan;
  if (c && Date.now() - c.at < 5000) return c.data;
  const data = scan();
  globalThis.__bosScan = { at: Date.now(), data };
  return data;
}

export function findFile(id) {
  return cached().files.get(id) || null;
}

const infoIndex = new Map(Object.entries(seriesInfo).map(([k, v]) => [k.normalize("NFC").trim().toLowerCase(), v]));
const infoFor = (key) => seriesInfo[key] || infoIndex.get(key.normalize("NFC").trim().toLowerCase()) || {};

// What the page (and so the browser) gets. Locked episodes carry no link at all.
export function getLibrary() {
  const { root, groups, missing } = cached();
  const used = new Set();
  const series = groups.map((g) => {
    const info = infoFor(g.key);
    let slug = slugify(g.key);
    while (used.has(slug)) slug += "-2";
    used.add(slug);

    const ordered = [...g.vids.filter((v) => isTrailer(path.basename(v.rel))), ...g.vids.filter((v) => !isTrailer(path.basename(v.rel)))];
    let n = 0;
    const episodes = ordered.map((v) => {
      const file = path.basename(v.rel);
      const meta = (info.episodes && (info.episodes[file] || info.episodes[path.basename(file, path.extname(file))])) || {};
      const trailer = !g.single && isTrailer(file);
      const num = trailer ? 0 : ++n;
      const locked = !trailer && typeof info.freeEpisodes === "number" && num > info.freeEpisodes;
      return {
        key: v.id,
        num,
        trailer,
        label: g.single ? "Full video" : trailer ? "Trailer" : `Episode ${num}`,
        short: g.single ? "Play" : trailer ? "Trailer" : String(num),
        title: meta.title || "",
        plot: meta.plot || "",
        locked,
        src: locked ? null : signedUrl(v.id),
      };
    });

    return {
      slug,
      title: info.title || pretty(g.key),
      genre: info.genre || "",
      plot: info.plot || "",
      cast: info.cast || [],
      tags: info.tags || [],
      likes: typeof info.likes === "number" ? info.likes : null,
      saves: typeof info.saves === "number" ? info.saves : null,
      poster: g.poster ? signedUrl(g.poster) : null,
      episodes,
    };
  });
  return { series, missing, folder: path.relative(process.cwd(), root) || root };
}
