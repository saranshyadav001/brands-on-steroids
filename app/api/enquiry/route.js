import { site } from "@/data/site";

// Website enquiries are emailed to the address in data/site.js (through Resend, needs
// RESEND_API_KEY) and, when a Telegram bot is set up, posted there as well.
// Each returns true (sent), false (failed) or null (not set up).
async function byEmail({ name, email, text }) {
  if (!process.env.RESEND_API_KEY) return null;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM || "Brands On Steroids website <onboarding@resend.dev>",
        to: [site.email],
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

    const text = [
      "New website enquiry",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${clean(b.company, 150) || "-"}`,
      `Interested in: ${clean(b.service, 100) || "-"}`,
      "",
      message,
    ].join("\n");

    const sent = await Promise.all([byEmail({ name, email, text }), byTelegram({ text })]);
    if (!sent.includes(true)) throw new Error("enquiry not delivered");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
