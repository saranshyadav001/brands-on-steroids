// Streams a catalogue video (or poster) to the on-page player only.
//
// A request is refused unless ALL of these hold:
//   1. the link carries a valid, unexpired signature (links are issued when the page renders)
//   2. it comes from a <video>/<img> element on this site - opening the link in a
//      new tab, "Save link as", or embedding it on another site gets a 403
import fs from "fs";
import { findFile, verifyLink } from "@/lib/library";
import { r2Get } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds a host like Vercel lets one video request run; the player asks again for the rest

const deny = (status, msg) => new Response(msg, { status, headers: { "Cache-Control": "no-store" } });

function allowedCaller(req, kind) {
  const dest = req.headers.get("sec-fetch-dest");
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false; // other sites, or typed/pasted into the address bar
  if (dest) return dest === kind; // "video" for the player, "image" for posters; "document" = opened directly
  // Browsers that do not send Sec-Fetch-* (plain http on a LAN address, very old browsers)
  const ref = req.headers.get("referer");
  if (!ref) return false;
  try {
    return new URL(ref).host === req.headers.get("host");
  } catch {
    return false;
  }
}

function fileStream(file, start, end) {
  const rs = fs.createReadStream(file, { start, end });
  return new ReadableStream({
    start(c) {
      rs.on("data", (chunk) => {
        try {
          c.enqueue(new Uint8Array(chunk));
          if (c.desiredSize <= 0) rs.pause();
        } catch {
          rs.destroy();
        }
      });
      rs.on("end", () => {
        try {
          c.close();
        } catch {}
      });
      rs.on("error", (e) => {
        try {
          c.error(e);
        } catch {}
      });
    },
    pull() {
      rs.resume();
    },
    cancel() {
      rs.destroy();
    },
  });
}

const HEADERS = (file) => ({
  "Content-Type": file.mime,
  "Accept-Ranges": "bytes",
  "Content-Disposition": "inline",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
});

// The file lives in the R2 bucket: pass the player's request on and hand back what R2 sends.
async function fromBucket(req, file) {
  const range = req.headers.get("range");
  let res;
  try {
    res = await r2Get(file.key, range && /^bytes=\d*-\d*$/.test(range.trim()) ? range.trim() : null);
  } catch {
    return deny(502, "Storage unavailable");
  }
  if (res.status === 416) {
    return new Response(null, { status: 416, headers: { "Content-Range": res.headers.get("content-range") || "bytes */*" } });
  }
  if (!res.ok) return deny(res.status === 404 ? 404 : 502, res.status === 404 ? "Not found" : "Storage unavailable");

  const headers = HEADERS(file);
  for (const h of ["content-length", "content-range"]) {
    if (res.headers.get(h)) headers[h] = res.headers.get(h);
  }
  return new Response(res.body, { status: res.status, headers });
}

export async function GET(req, { params }) {
  const url = new URL(req.url);
  const file = await findFile(params.id);
  if (!file || !verifyLink(params.id, url.searchParams.get("e"), url.searchParams.get("s"))) return deny(404, "Not found");
  if (!allowedCaller(req, file.kind)) return deny(403, "Forbidden");

  if (file.key) return fromBucket(req, file);

  let size;
  try {
    size = fs.statSync(file.abs).size;
  } catch {
    return deny(404, "Not found");
  }

  const headers = HEADERS(file);

  const range = req.headers.get("range");
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (m && (m[1] || m[2])) {
    let start, end;
    if (m[1] === "") {
      start = Math.max(0, size - Number(m[2])); // "bytes=-500" = last 500 bytes
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    }
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    return new Response(fileStream(file.abs, start, end), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  return new Response(fileStream(file.abs, 0, Math.max(0, size - 1)), {
    status: 200,
    headers: { ...headers, "Content-Length": String(size) },
  });
}
