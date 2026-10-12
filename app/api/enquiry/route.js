// Where website enquiries are emailed.
const TO = process.env.ENQUIRY_TO || "contactsaranshyadav@gmail.com";
// The site FormSubmit knows this form by (its one-time activation is for this address + site).
const SITE = process.env.SITE_URL || "https://brands-on-steroids.vercel.app";

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

export async function POST(req) {
  try {
    const b = await req.json();
    if (b.company_website) return Response.json({ ok: true }); // honeypot: pretend success

    const clean = (v, n = 500) => String(v || "").trim().slice(0, n);
    const name = clean(b.name, 100).replace(/[\r\n]+/g, " ");
    const email = clean(b.email, 150);
    const message = clean(b.message, 2000);
    if (!name || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) || !message) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const company = clean(b.company, 150);
    const service = clean(b.service, 300);
    const text = [
      "New website enquiry",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "-"}`,
      `Interested in: ${service || "-"}`,
      "",
      message,
    ].join("\n");

    const fields = { name, email, company: company || "-", "interested in": service || "-", message };
    const sent = await Promise.all([byEmail({ name, email, text, fields }), byTelegram({ text })]);
    if (!sent.includes(true)) throw new Error("enquiry not delivered");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
