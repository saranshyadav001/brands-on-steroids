// Server-only: reads the videos from the Cloudflare R2 bucket.
//   - On Cloudflare (the live site) through the bucket attached in wrangler.jsonc ("VIDEOS").
//   - Anywhere else (your computer, another host) through R2's S3-compatible API, when the
//     R2_* settings are filled in (see .env.example).
// With neither, the site reads the folders on this computer and this file does nothing.
import { AwsClient } from "aws4fetch";

const LIST_TTL = 60 * 1000; // the bucket is listed at most once a minute

// On Cloudflare the Worker (worker/index.js) hands over the attached bucket on every request.
let attached = null;
export const useBucket = (bucket) => {
  attached = bucket || null;
};
const bound = () => attached;

const keyed = () =>
  Boolean(
    process.env.R2_BUCKET &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      (process.env.R2_ACCOUNT_ID || process.env.R2_ENDPOINT)
  );

export const r2Enabled = () => Boolean(bound()) || keyed();
export const r2Name = () => (bound() ? "bos-videos" : process.env.R2_BUCKET);

const client = () =>
  new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });

const bucketUrl = () => {
  const base = (process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`).replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(process.env.R2_BUCKET)}`;
};
const objectUrl = (key) => `${bucketUrl()}/${key.split("/").map(encodeURIComponent).join("/")}`;

const XML = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const unxml = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : XML[e.toLowerCase()]
  );
const tag = (xml, name) => {
  const m = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(xml);
  return m ? unxml(m[1]) : "";
};

async function listAll() {
  const out = [];
  const bucket = bound();
  if (bucket) {
    let cursor;
    do {
      const page = await bucket.list({ cursor });
      for (const o of page.objects) if (!o.key.endsWith("/")) out.push({ key: o.key, etag: o.etag });
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    return out;
  }
  const aws = client();
  let token = "";
  do {
    const url = `${bucketUrl()}?list-type=2${token ? `&continuation-token=${encodeURIComponent(token)}` : ""}`;
    const res = await aws.fetch(url, { cache: "no-store" });
    const xml = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${tag(xml, "Code") || res.statusText}`);
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = tag(m[1], "Key");
      if (key && !key.endsWith("/")) out.push({ key, etag: tag(m[1], "ETag") });
    }
    token = tag(xml, "IsTruncated") === "true" ? tag(xml, "NextContinuationToken") : "";
  } while (token);
  return out;
}

// Every file in the bucket: [{ key, etag }]
export function r2List() {
  const c = globalThis.__bosR2List;
  if (c && Date.now() - c.at < LIST_TTL) return c.data;
  const data = listAll();
  globalThis.__bosR2List = { at: Date.now(), data };
  data.catch(() => {
    if (globalThis.__bosR2List && globalThis.__bosR2List.data === data) globalThis.__bosR2List = null; // try again next time
  });
  return data;
}

// A small text file (the description of a series). Kept until the file changes.
export async function r2Text(key, etag) {
  const cache = (globalThis.__bosR2Text ||= new Map());
  const hit = cache.get(key);
  if (hit && hit.etag === etag) return hit.text;
  try {
    let text;
    const bucket = bound();
    if (bucket) {
      const obj = await bucket.get(key);
      if (!obj) return "";
      text = await obj.text();
    } else {
      const res = await client().fetch(objectUrl(key), { cache: "no-store" });
      if (!res.ok) return "";
      text = await res.text();
    }
    text = text.replace(/^﻿/, "");
    cache.set(key, { etag, text });
    return text;
  } catch {
    return "";
  }
}

// The file itself, or the part of it the player asked for ("bytes=0-", "bytes=100-199", "bytes=-500").
// Always answers like a web server: a Response with status 200 / 206 / 404 / 416 and,
// for a part, Content-Range.
export async function r2Get(key, range) {
  const bucket = bound();
  if (!bucket) return client().fetch(objectUrl(key), { cache: "no-store", headers: range ? { Range: range } : {} });

  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  let want;
  if (m && m[1] !== "") want = m[2] !== "" ? { offset: Number(m[1]), length: Number(m[2]) - Number(m[1]) + 1 } : { offset: Number(m[1]) };
  else if (m && m[2] !== "") want = { suffix: Number(m[2]) };
  if (want && (want.length <= 0 || want.suffix === 0)) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */*" } });

  let obj;
  try {
    obj = await bucket.get(key, want ? { range: want } : undefined);
  } catch {
    return new Response(null, { status: 416, headers: { "Content-Range": "bytes */*" } }); // asked for a part past the end
  }
  if (!obj) return new Response(null, { status: 404 });
  if (!want) return new Response(obj.body, { status: 200, headers: { "Content-Length": String(obj.size) } });

  const start = want.suffix != null ? Math.max(0, obj.size - want.suffix) : want.offset;
  const end = want.length != null ? Math.min(start + want.length, obj.size) - 1 : obj.size - 1;
  return new Response(obj.body, {
    status: 206,
    headers: { "Content-Range": `bytes ${start}-${end}/${obj.size}`, "Content-Length": String(end - start + 1) },
  });
}
