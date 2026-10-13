// Server-only: scans the content folder and builds the catalogue.
// Video files are never exposed as plain /public URLs. The browser only ever
// receives short-lived signed links to /api/stream/<id> (see app/api/stream).
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { contentDir, seriesInfo, order } from "@/data/catalogue";
import { homeDir, filmTitles, folderLabels, filmNotes, folderNotes, filmsHidden, filmsFirst } from "@/data/home";
import { r2Enabled, r2List, r2Name, r2Text } from "@/lib/r2";

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

// --- description files ------------------------------------------------------
// Each series folder can hold a text file (description.md, discription.md, about.txt ...).
// Expected shape - every part is optional:
//
//   Title of the series
//   One-line hook.
//
//   Plot paragraphs ...
//
//   Genre · Sci-Fi Thriller · Mystery        <- "Name · value" lines become the details list;
//   Format · 9:16 vertical                       Genre also becomes the chips + the card label
//   Status · Pilot complete
//
//   Episode 1: The Garland                   <- optional per-episode text
//   One-line hook for the episode.
//   What happens in the episode ...
const TEXT = new Set([".md", ".txt"]);

function readText(file) {
  try {
    const t = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    return t.startsWith("version https://git-lfs") ? "" : t; // file not downloaded from Git LFS
  } catch {
    return "";
  }
}

const unmark = (l) =>
  l
    .replace(/^\s{0,3}#{1,6}\s+/, "") // "# Heading"
    .replace(/^\s*>\s?/, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2") // **bold**
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=$|[\s).,;:!?])/g, "$1$2") // *italic*
    .trim();

const STATUS_ONLY = /^(pilot|episode|episodes|series|season)\b.{0,40}\b(complete|completed|produced|in development)\.?$/i;
const EP_HEAD = /^(?:episode|ep|part)\.?\s*(\d+)\s*(?:[:\-\u2013\u2014\u00b7.]\s*(.*))?$/i;
const FACT = /^([^\u00b7:]{2,28}?)\s+\u00b7\s+(.+)$/; // "Genre · Sci-Fi"

export function parseAbout(raw) {
  const out = { title: "", logline: "", plot: "", genres: [], facts: [], notes: [], episodes: {} };
  if (!raw) return out;
  const lines = raw.replace(/\r/g, "").split("\n").map(unmark);
  let i = 0;
  const skipBlank = () => {
    while (i < lines.length && !lines[i]) i++;
  };
  skipBlank();
  while (i < lines.length && STATUS_ONLY.test(lines[i])) i++; // a stray "Pilot complete" above the title
  skipBlank();
  if (i < lines.length && !EP_HEAD.test(lines[i])) out.title = lines[i++];
  skipBlank();
  if (i < lines.length && !FACT.test(lines[i]) && !EP_HEAD.test(lines[i])) out.logline = lines[i++];

  const paras = [];
  let cur = [];
  let ep = null; // episode block being read
  let sawFacts = false;
  const flush = () => {
    if (cur.length) (ep ? ep.paras : paras).push(cur.join(" "));
    cur = [];
  };
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (!l) {
      flush();
      continue;
    }
    const eh = EP_HEAD.exec(l);
    if (eh) {
      flush();
      ep = { title: (eh[2] || "").trim(), paras: [], fresh: true, tagline: "" };
      out.episodes[Number(eh[1])] = ep;
      continue;
    }
    const f = !ep && FACT.exec(l);
    if (f) {
      flush();
      sawFacts = true;
      const k = f[1].trim();
      const v = f[2].trim();
      if (/^genres?$/i.test(k)) out.genres = v.split(/\s+\u00b7\s+|\s+\/\s+|,\s+|\s+\|\s+/).map((x) => x.trim()).filter(Boolean);
      else out.facts.push({ k, v });
      continue;
    }
    if (ep && ep.fresh) {
      ep.fresh = false;
      ep.tagline = l; // first line under an episode heading
      continue;
    }
    if (!ep && sawFacts) {
      out.notes.push(l); // e.g. "Treatment & deck on request"
      continue;
    }
    cur.push(l);
  }
  flush();
  out.plot = paras.join("\n\n");
  for (const k of Object.keys(out.episodes)) {
    const e = out.episodes[k];
    out.episodes[k] = { title: e.title, tagline: e.tagline, plot: e.paras.join("\n\n") };
  }
  return out;
}

// "RO ep2.MOV" -> 2, "Kalyug ka ant Part ep2.mp4" -> 2, "banta-pilot.mp4" -> null
const epNumber = (file) => {
  const m = /(?:^|[^a-z])(?:ep|episode|part|pt)\.?[\s._-]*(\d{1,3})(?!\d)/i.exec(file);
  return m ? Number(m[1]) : null;
};

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

// The bucket can hold the folder at any depth ("md/...", "website .../md/..."): it is found by name.
function r2Prefix(keys, wanted, name, fixed) {
  if (fixed != null) return fixed.replace(/^\/+|\/+$/g, "") ? `${fixed.replace(/^\/+|\/+$/g, "")}/` : "";
  if (keys.some((k) => k.startsWith(`${wanted}/`))) return `${wanted}/`;
  let best = null;
  for (const k of keys) {
    const parts = k.split("/");
    const i = parts.slice(0, -1).findIndex((p) => name.test(p.trim()));
    if (i < 0) continue;
    const pre = `${parts.slice(0, i + 1).join("/")}/`;
    if (best == null || pre.length < best.length) best = pre;
  }
  return best;
}

// One content folder, from the R2 bucket when the R2_* settings are filled in, otherwise from this
// computer: { folder, missing, rels: [paths inside it], at(rel) -> where the file is, text(rel) }
async function source(localRoot, wanted, name, fixed) {
  if (!r2Enabled()) {
    const root = localRoot();
    const folder = path.relative(process.cwd(), root) || root;
    if (!fs.existsSync(root)) return { folder, rels: [], missing: true };
    return { folder, rels: walk(root), missing: false, at: (rel) => ({ abs: path.join(root, rel) }), text: async (rel) => readText(path.join(root, rel)) };
  }
  const bucket = `the R2 bucket "${r2Name()}"`;
  let keys;
  try {
    keys = await r2List();
  } catch (e) {
    console.error(`R2: could not list ${bucket}: ${e.message}`);
    return { folder: bucket, rels: [], missing: true };
  }
  const prefix = r2Prefix(keys.map((k) => k.key), wanted, name, fixed);
  if (prefix == null) return { folder: bucket, rels: [], missing: true };
  const etags = new Map(keys.map((k) => [k.key, k.etag]));
  return {
    folder: prefix ? `${bucket}, folder "${prefix.slice(0, -1)}"` : bucket,
    rels: keys.filter((k) => k.key.startsWith(prefix)).map((k) => k.key.slice(prefix.length)).filter((r) => r && !r.split("/").some((p) => p.startsWith("."))),
    missing: false,
    at: (rel) => ({ key: prefix + rel }),
    text: (rel) => r2Text(prefix + rel, etags.get(prefix + rel)),
  };
}

async function scan() {
  const src = await source(resolveContentDir, contentDir, /^md$/i, process.env.R2_MD_FOLDER);
  const files = new Map(); // id -> { abs | key, kind, mime }
  const groups = []; // { key, items: [relative paths] }
  if (src.missing) return { folder: src.folder, files, groups, missing: true };

  const add = (rel) => {
    const e = ext(rel);
    const id = hashId(rel);
    files.set(id, { ...src.at(rel), kind: VIDEO[e] ? "video" : "image", mime: VIDEO[e] || IMAGE[e] });
    return id;
  };

  const loose = src.rels.filter((r) => !r.includes("/")); // files directly in the folder
  const dirs = [...new Set(src.rels.filter((r) => r.includes("/")).map((r) => r.slice(0, r.indexOf("/"))))];
  const top = [...dirs.map((name) => ({ name, dir: true })), ...loose.map((name) => ({ name }))];
  for (const d of top.sort((a, b) => natural(a.name, b.name))) {
    if (d.dir) {
      const all = src.rels.filter((r) => r.startsWith(`${d.name}/`));
      const vids = all.filter((r) => VIDEO[ext(r)]).sort(natural);
      if (!vids.length) continue;
      const img = all.filter((r) => IMAGE[ext(r)]).sort(natural);
      const poster = img.find((r) => /poster|cover|thumb/i.test(path.basename(r))) || img[0];
      const txt = all.filter((r) => TEXT.has(ext(r))).sort(natural);
      const about = txt.find((r) => /^(des|dis|about|info|readme|synopsis)/i.test(path.basename(r))) || txt[0];
      groups.push({
        key: d.name,
        vids: vids.map((r) => ({ rel: r, id: add(r) })),
        poster: poster ? add(poster) : null,
        about: about ? await src.text(about) : "",
      });
    } else if (VIDEO[ext(d.name)]) {
      const stem = path.basename(d.name, path.extname(d.name));
      const img = loose.find((x) => IMAGE[ext(x)] && path.basename(x, path.extname(x)) === stem);
      const txt = loose.find((x) => TEXT.has(ext(x)) && path.basename(x, path.extname(x)) === stem);
      groups.push({
        key: stem,
        single: true,
        vids: [{ rel: d.name, id: add(d.name) }],
        poster: img ? add(img) : null,
        about: txt ? await src.text(txt) : "",
      });
    }
  }
  return { folder: src.folder, files, groups, missing: false };
}

// Both scans are shared by every request for a few seconds (returns a promise).
function cached() {
  const c = globalThis.__bosScan;
  if (c && Date.now() - c.at < 5000) return c.data;
  const data = scan();
  globalThis.__bosScan = { at: Date.now(), data };
  return data;
}

export async function findFile(id) {
  return (await cached()).files.get(id) || (await cachedWork()).files.get(id) || null;
}

const infoIndex = new Map(Object.entries(seriesInfo).map(([k, v]) => [k.normalize("NFC").trim().toLowerCase(), v]));
const infoFor = (key) => seriesInfo[key] || infoIndex.get(key.normalize("NFC").trim().toLowerCase()) || {};

// What the page (and so the browser) gets. Locked episodes carry no link at all.
export async function getLibrary() {
  const { folder, groups, missing } = await cached();
  const used = new Set();
  const series = groups.map((g) => {
    const info = infoFor(g.key);
    let slug = slugify(g.key);
    while (used.has(slug)) slug += "-2";
    used.add(slug);

    const about = parseAbout(g.about);
    const trailers = g.vids.filter((v) => isTrailer(path.basename(v.rel)));
    const rest = g.vids.filter((v) => !isTrailer(path.basename(v.rel))).map((v) => ({ ...v, n: epNumber(path.basename(v.rel)) }));
    // use the numbers in the file names when every episode has its own; otherwise count 1, 2, 3 ...
    const numbered = rest.every((v) => v.n != null) && new Set(rest.map((v) => v.n)).size === rest.length;
    if (numbered) rest.sort((x, y) => x.n - y.n);
    const lone = g.vids.length === 1;

    let n = 0;
    const episodes = [...trailers, ...rest].map((v) => {
      const file = path.basename(v.rel);
      const meta = (info.episodes && (info.episodes[file] || info.episodes[path.basename(file, path.extname(file))])) || {};
      const trailer = !lone && isTrailer(file);
      const num = trailer ? 0 : numbered ? v.n : ++n;
      const fromFile = (!trailer && about.episodes[num]) || {};
      const locked = !trailer && typeof info.freeEpisodes === "number" && num > info.freeEpisodes;
      const label = trailer ? "Trailer" : lone && v.n == null ? (/pilot/i.test(file) ? "Pilot" : isTrailer(file) || isTrailer(g.key) ? "Trailer" : "Full video") : `Episode ${num}`;
      return {
        key: v.id,
        num,
        trailer,
        label,
        short: trailer ? "Trailer" : String(num),
        title: meta.title || fromFile.title || "",
        tagline: meta.tagline || fromFile.tagline || "",
        plot: meta.plot || fromFile.plot || "",
        locked,
        src: locked ? null : signedUrl(v.id),
      };
    });

    const genres = info.genre ? [info.genre] : about.genres;
    return {
      slug,
      title: info.title || about.title || pretty(g.key),
      genre: genres[0] || "",
      genres,
      logline: info.logline || about.logline || "",
      plot: info.plot || about.plot || "",
      facts: about.facts,
      notes: about.notes,
      cast: info.cast || [],
      tags: info.tags || [],
      likes: typeof info.likes === "number" ? info.likes : null,
      saves: typeof info.saves === "number" ? info.saves : null,
      poster: g.poster ? signedUrl(g.poster) : null,
      episodes,
    };
  });
  const norm = (k) => k.normalize("NFC").trim().toLowerCase();
  const rank = new Map((order || []).map((k, i) => [norm(k), i]));
  const pos = new Map(groups.map((g, i) => [series[i], rank.has(norm(g.key)) ? rank.get(norm(g.key)) : Infinity]));
  series.sort((a, b) => pos.get(a) - pos.get(b)); // stable: unlisted titles keep their A-Z order
  return { series, missing, folder };
}

// ---------------------------------------------------------------------------
// HOME PAGE "AD FILMS": the videos in the homepage folder, then its sub-folders
// ---------------------------------------------------------------------------
const lower = (k) => k.normalize("NFC").trim().toLowerCase();

// Turns a messy file name (Instagram caption, export name ...) into a short title.
export function cleanTitle(stem) {
  let t = stem.normalize("NFC").trim().replace(/^#+\s*/, "");
  if (/^(\d[\d\s._-]*|igexport.*|img[\s_-]?\d+.*|dsc[\s_-]?\d+.*|\d{1,2}[\s-][a-z]{3}[\s-]\d{4}.*|untitled.*|final draft.*)$/i.test(t)) return ""; // no real name
  t = t.split(/\p{Extended_Pictographic}|#|\s@|-{3,}|\u2022/u)[0]; // stop at an emoji, hashtag, @mention
  t = t.replace(/(\))(?=\p{Lu}).*$/u, "$1"); // "(the groups version)This video ..." -> keep up to ")"
  t = t.replace(/(\p{Script=Latin})(?=[^\p{Script=Latin}\p{N}\p{P}\p{Z}]).*$/u, "$1"); // caption switches alphabet
  if (t.length > 48) t = t.split(/[.!?]\s/)[0]; // first sentence only
  t = t.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  for (let i = 0; i < 3; i++) t = t.replace(/[\s_-]+(c\d+|v\d+|final(\s*\d+)?|draft(\s*\d+)?|copy|h264|\d{1,2})$/i, "").trim(); // "_c9", "FINAL 3"
  t = t.replace(/[.,;:'"\u2019\s-]+$/, "");
  if (t.length > 64) t = t.slice(0, 64).replace(/\s+\S*$/, "");
  return /[a-z]/.test(t) && /[A-Z]/.test(t) ? t : t.toLowerCase().replace(/(^|\s|\()\p{L}/gu, (c) => c.toUpperCase());
}

function resolveHomeDir() {
  const wanted = path.join(process.cwd(), homeDir);
  if (fs.existsSync(wanted)) return wanted;
  // Fallback: a folder called "homepage" next to the micro-drama folder
  const base = path.dirname(resolveContentDir());
  try {
    const d = fs.readdirSync(base, { withFileTypes: true }).find((x) => x.isDirectory() && /^home\s*page$/i.test(x.name.trim()));
    if (d) return path.join(base, d.name);
  } catch {}
  return wanted;
}

async function scanHome() {
  const src = await source(resolveHomeDir, homeDir, /^home\s*page$/i, process.env.R2_HOME_FOLDER);
  const files = new Map();
  const found = []; // { group, stem, id }
  if (src.missing) return { folder: src.folder, files, found, missing: true };

  const take = (group) => {
    const inside = group ? src.rels.filter((r) => r.startsWith(`${group}/`)).map((r) => r.slice(group.length + 1)) : src.rels;
    for (const name of inside.filter((r) => !r.includes("/")).sort(natural)) {
      if (!VIDEO[ext(name)]) continue;
      const id = hashId(`home:${group}/${name}`);
      files.set(id, { ...src.at(group ? `${group}/${name}` : name), kind: "video", mime: VIDEO[ext(name)] });
      found.push({ group, stem: path.basename(name, path.extname(name)), id });
    }
  };

  take(""); // the homepage folder's own videos first ...
  const dirs = [...new Set(src.rels.filter((r) => r.includes("/")).map((r) => r.slice(0, r.indexOf("/"))))];
  for (const d of dirs.sort(natural)) take(d); // ... then each folder inside it
  return { folder: src.folder, files, found, missing: false };
}

function cachedWork() {
  const c = globalThis.__bosHome;
  if (c && Date.now() - c.at < 5000) return c.data;
  const data = scanHome();
  globalThis.__bosHome = { at: Date.now(), data };
  return data;
}

export async function getHomeFilms() {
  const { folder, found, missing } = await cachedWork();
  const titles = new Map(Object.entries(filmTitles || {}).map(([k, v]) => [lower(k), v]));
  const labels = new Map(Object.entries(folderLabels || {}).map(([k, v]) => [lower(k), v]));
  const notes = new Map(Object.entries(filmNotes || {}).map(([k, v]) => [lower(k), v]));
  const groupNotes = new Map(Object.entries(folderNotes || {}).map(([k, v]) => [lower(k), v]));
  const hidden = new Set((filmsHidden || []).map(lower));
  const first = new Map((filmsFirst || []).map((k, i) => [lower(k), i]));

  const list = found
    .filter((f) => !hidden.has(lower(f.stem)))
    .map((f) => ({ f, rank: first.has(lower(f.stem)) ? first.get(lower(f.stem)) : Infinity }));
  list.sort((a, b) => a.rank - b.rank); // stable: everything else keeps folder + A-Z order

  let n = 0;
  const items = list.map(({ f }) => {
    n++;
    return {
      key: f.id,
      title: titles.get(lower(f.stem)) || cleanTitle(f.stem) || `Film ${String(n).padStart(2, "0")}`,
      group: f.group ? (labels.has(lower(f.group)) ? labels.get(lower(f.group)) : pretty(f.group.trim())) : "",
      note: notes.get(lower(f.stem)) || (f.group && groupNotes.get(lower(f.group))) || "",
      src: signedUrl(f.id),
    };
  });
  return { items, missing, folder };
}
