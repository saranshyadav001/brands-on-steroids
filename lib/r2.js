// Server-only: reads the videos from the Cloudflare R2 bucket (S3-compatible API).
// Used when the R2_* settings are filled in (see .env.example); otherwise the site
// reads the folders on this computer and this file does nothing.
import { AwsClient } from "aws4fetch";

const LIST_TTL = 60 * 1000; // the bucket is listed at most once a minute

export const r2Enabled = () =>
  Boolean(
    process.env.R2_BUCKET &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      (process.env.R2_ACCOUNT_ID || process.env.R2_ENDPOINT)
  );

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
  const aws = client();
  const out = [];
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
    const res = await client().fetch(objectUrl(key), { cache: "no-store" });
    if (!res.ok) return "";
    const text = (await res.text()).replace(/^﻿/, "");
    cache.set(key, { etag, text });
    return text;
  } catch {
    return "";
  }
}

// The file itself (or the part of it the player asked for).
export function r2Get(key, range) {
  return client().fetch(objectUrl(key), { cache: "no-store", headers: range ? { Range: range } : {} });
}
