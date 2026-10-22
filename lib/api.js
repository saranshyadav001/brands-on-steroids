// The site's three server answers. They run in the Cloudflare Worker (worker/index.js) on the
// live site, and in the app/api/*/route.dev.js files when you run `npm run dev`.
//   libraryResponse  GET  /api/library      what the pages show: catalogue + home ad films
//   streamResponse   GET  /api/stream/<id>  a video (or poster), for the on-page player only
//   enquiryResponse  POST /api/enquiry      the contact form
import fs from "fs";
import { findFile, verifyLink, getLibrary, getHomeFilms } from "./library.js";
import { r2Get } from "./r2.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

// ---------------------------------------------------------------------------
// /api/library - built at most once a minute and reused (the video links in it last 12 hours)
// ---------------------------------------------------------------------------
export async function libraryResponse() {
  const c = globalThis.__bosPayload;
  if (c && Date.now() - c.at < 60000) return new Response(c.body, { headers: c.headers });
  const [catalogue, films] = await Promise.all([getLibrary(), getHomeFilms()]);
  const body = JSON.stringify({ catalogue, films });
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (!catalogue.missing || !films.missing) globalThis.__bosPayload = { at: Date.now(), body, headers };
  return new Response(body, { headers });
}

// ---------------------------------------------------------------------------
// /api/stream/<id>
// A request is refused unless ALL of these hold:
//   1. the link carries a valid, unexpired signature (links are issued by /api/library)
//   2. it comes from a <video>/<img> element on this site - opening the link in a
//      new tab, "Save link as", or embedding it on another site gets a 403
// ---------------------------------------------------------------------------
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

export async function streamResponse(req, id) {
  const url = new URL(req.url);
  const file = await findFile(id);
  if (!file || !verifyLink(id, url.searchParams.get("e"), url.searchParams.get("s"))) return deny(404, "Not found");
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

// ---------------------------------------------------------------------------
// /api/enquiry
// ---------------------------------------------------------------------------
// Where website enquiries are emailed.
const TO = process.env.ENQUIRY_TO || "contactsaranshyadav@gmail.com";
// The site FormSubmit knows this form by (its one-time activation is for this address + site).
const SITE = process.env.SITE_URL || "https://www.brandsonsteroids.com";

// On the live site the Worker hands over `mail(raw)`, which sends through Cloudflare Email Routing
// (the address above must be a verified destination there). Builds that message.
const b64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const word = (s) => `=?UTF-8?B?${b64(s)}?=`;
function mimeMessage({ from, name, email, text }) {
  return [
    `From: ${word("Brands On Steroids website")} <${from}>`,
    `To: <${TO}>`,
    `Reply-To: ${word(name)} <${email}>`,
    `Subject: ${word(`New website enquiry from ${name}`)}`,
    `Message-ID: <${crypto.randomUUID()}@brandsonsteroids.com>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(text).replace(/.{76}/g, "$&\r\n"),
  ].join("\r\n");
}
export const ENQUIRY = { to: () => TO, from: "website@brandsonsteroids.com" };

// Enquiries are emailed to TO and, when a Telegram bot is set up, posted there as well.
// Email goes through Resend when RESEND_API_KEY is set, otherwise through FormSubmit
// (no account needed: the first enquiry makes FormSubmit email TO an "Activate form"
// link, which has to be clicked once).
// Each sender returns true (sent), false (failed) or null (not set up).
async function byFormSubmit({ name, email, fields }) {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Origin: SITE, Referer: `${SITE}/` },
      body: JSON.stringify({ _subject: `New website enquiry from ${name}`, _template: "table", _captcha: "false", _replyto: email, ...fields }),
    });
    const out = await res.json().catch(() => ({}));
    if (String(out.success) !== "true") console.error("FormSubmit:", res.status, out.message || "");
    return res.ok && String(out.success) === "true";
  } catch {
    return false;
  }
}

async function byEmail({ name, email, text, fields }) {
  if (!process.env.RESEND_API_KEY) return byFormSubmit({ name, email, fields });
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM || "Brands On Steroids website <onboarding@resend.dev>",
        to: [TO],
        reply_to: email, // "Reply" in the inbox answers the person who wrote
        subject: `New website enquiry from ${name}`,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function byTelegram({ text }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function enquiryResponse(req, mail) {
  try {
    const b = await req.json();
    if (b.company_website) return json({ ok: true }); // honeypot: pretend success

    const clean = (v, n = 500) => String(v || "").trim().slice(0, n);
    const name = clean(b.name, 100).replace(/[\r\n]+/g, " ");
    const email = clean(b.email, 150);
    const message = clean(b.message, 2000);
    if (!name || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) || !message) {
      return json({ error: "Missing fields" }, 400);
    }

    const company = clean(b.company, 150);
    const service = clean(b.service, 300);
    const other = clean(b.other, 100);
    const text = [
      "New website enquiry",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "-"}`,
      `Interested in: ${service || "-"}`,
      `Other services: ${other || "-"}`,
      "",
      message,
    ].join("\n");

    const fields = { name, email, company: company || "-", "interested in": service || "-", "other services": other || "-", message };
    // email: through Cloudflare when available, otherwise Resend / FormSubmit (see above)
    let emailed = false;
    if (mail) {
      try {
        await mail(mimeMessage({ from: ENQUIRY.from, name, email, text }));
        emailed = true;
      } catch (e) {
        console.error("Cloudflare email:", e?.message || e);
      }
    }
    const sent = await Promise.all([emailed || byEmail({ name, email, text, fields }), byTelegram({ text })]);
    if (!sent.includes(true)) throw new Error("enquiry not delivered");
    return json({ ok: true });
  } catch {
    return json({ error: "Failed" }, 500);
  }
}
