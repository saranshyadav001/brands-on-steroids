export async function POST(req) {
  try {
    const b = await req.json();
    if (b.company_website) return Response.json({ ok: true }); // honeypot: pretend success

    const clean = (v, n = 500) => String(v || "").trim().slice(0, n);
    const name = clean(b.name, 100);
    const email = clean(b.email, 150);
    const message = clean(b.message, 2000);
    if (!name || !email || !message) {
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

    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
    });
    if (!res.ok) throw new Error("telegram failed");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
