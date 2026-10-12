"use client";
import { useEffect, useState } from "react";
import { ipDrop } from "@/data/site";

// Micro-drama page, just before the services: the "IPs ready for sale" line with a
// countdown (days, hours, minutes, seconds) to the date in data/site.js (ipDrop.ends).
const two = (n) => String(n).padStart(2, "0");

export default function IpDrop() {
  const [left, setLeft] = useState(null); // seconds left; null until the page is running in the browser

  useEffect(() => {
    const end = new Date(ipDrop.ends).getTime();
    const f = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    f();
    const t = setInterval(f, 1000);
    return () => clearInterval(t);
  }, []);

  const parts = [
    ["Days", left == null ? null : Math.floor(left / 86400)],
    ["Hours", left == null ? null : Math.floor(left / 3600) % 24],
    ["Minutes", left == null ? null : Math.floor(left / 60) % 60],
    ["Seconds", left == null ? null : left % 60],
  ];

  return (
    <section id="ips" data-cursor-light className="bg-ink px-5 py-20 text-white md:px-12 md:py-24">
      <div className="max-w-7xl">
        <p className="label mb-4">[ {ipDrop.label} ]</p>
        <h2 className="h-display lining-nums text-[clamp(1.6rem,7vw,2.75rem)] md:text-[clamp(1.75rem,4.6vw,4.5rem)]">
          <span className="text-brand">{ipDrop.count}</span> {ipDrop.line} <span className="text-brand">{ipDrop.accent}</span>
        </h2>

        <div role="timer" aria-label="Time left" className="mt-10 grid max-w-3xl grid-cols-4 gap-2 md:mt-12 md:gap-4">
          {parts.map(([name, n]) => (
            <div key={name} className="border border-white/15 bg-white/[0.04] px-2 py-4 text-center md:py-6">
              <p className="font-display text-[clamp(1.5rem,8vw,4rem)] font-extrabold leading-none lining-nums tabular-nums">{n == null ? "--" : two(n)}</p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50 md:mt-3 md:text-[11px]">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
