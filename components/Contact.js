"use client";
import { useState } from "react";
import { site } from "@/data/site";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  const field = "w-full border border-ink/20 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-ink";

  return (
    <section id="contact" data-cursor-light className="bg-brand px-5 py-24 text-white md:pl-[calc(84px+3rem)] md:pr-12">
      <div className="grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">Contact</p>
          <h2 className="h-display contact-title mt-4">Let&apos;s make something they&apos;ll binge.</h2>
          <p className="hand mt-4 text-3xl !text-white">Have a campaign idea that needs AI filmmaking?</p>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest">
            Most engagements start with a 30-minute call about what you want to ship.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.whatsapp} target="_blank" rel="noreferrer" data-cursor-dark className="btn bg-white text-brand hover:bg-ink hover:text-white">WhatsApp</a>
            <a href={`mailto:${site.email}`} className="btn border border-white hover:bg-white hover:text-brand">{site.email}</a>
          </div>
        </div>

        <form onSubmit={onSubmit} data-cursor-dark className="space-y-3 bg-paper p-6 text-ink">
          <h3 className="font-display text-xl font-extrabold uppercase">Tell us about your project</h3>
          {/* honeypot */}
          <input name="company_website" tabIndex={-1} autoComplete="off" className="hidden" />
          <input name="name" required placeholder="Name" className={field} />
          <input name="email" type="email" required placeholder="Email" className={field} />
          <input name="company" placeholder="Company / brand" className={field} />
          <select name="service" className={field} defaultValue="">
            <option value="" disabled>What are you interested in?</option>
            <option>On-demand AI video production</option>
            <option>Bulk AI micro-drama platform</option>
            <option>AI branded content</option>
            <option>Sponsored micro-drama series</option>
          </select>
          <textarea name="message" required rows={4} placeholder="Your message" className={field} />
          <button disabled={status === "sending"} className="btn btn-solid w-full disabled:opacity-60">
            {status === "sending" ? "Sending..." : "Initiate brand brief →"}
          </button>
          {status === "sent" && <p className="text-sm text-green-700">Thanks, we&apos;ll get back to you shortly.</p>}
          {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try WhatsApp or email.</p>}
        </form>
      </div>

      <div className="mt-20 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/30 pt-6 font-mono text-[11px] uppercase tracking-widest">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <div className="flex gap-5">
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:underline">{s.label}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
