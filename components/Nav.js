"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const link = "font-display text-sm font-bold uppercase tracking-[0.3em] hover:text-brand";

// The two pages. The one you are on is shown in pink.
const pages = [
  ["Home", "/"],
  ["Micro Drama", "/micro-drama"],
];

// Mobile full-page menu, per page
const menus = {
  "/": [
    ["Work", "#work"],
    ["Studio", "#about"],
    ["Contact", "#contact"],
  ],
  "/micro-drama": [
    ["Catalogue", "#catalogue"],
    ["On-demand production", "#on-demand"],
    ["Bulk AI microdrama", "#bulk-microdrama"],
    ["AI branded content", "#branded-content"],
    ["Sponsored microdrama series", "#sponsored-series"],
    ["Studio", "#about"],
    ["Contact", "#contact"],
  ],
};

export default function Nav() {
  const pathname = usePathname() || "/";
  const here = pathname.startsWith("/micro-drama") ? "/micro-drama" : "/";
  const micro = here === "/micro-drama";
  const menu = menus[here];
  const [scrolled, setScrolled] = useState(false);
  const [sound, setSound] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  // lock page scroll while the full-page mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function toggleSound() {
    const v = document.getElementById("hero-video");
    if (!v) return;
    const next = !sound;
    v.muted = !next;
    if (next && v.paused) v.play().catch(() => {});
    setSound(next);
  }

  // light text while over the video / the dark menu, dark text on the paper bar after scrolling
  // (the home page has a paper-coloured hero, so its bar is always dark text)
  const light = (micro && !scrolled) || open;
  const overVideo = micro && !scrolled && !open;
  const tab = (active) =>
    `border px-5 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.22em] transition ${
      active
        ? "border-brand bg-brand text-white"
        : overVideo
          ? "border-white/50 text-white hover:border-brand hover:text-brand"
          : "border-ink/20 text-ink hover:border-brand hover:text-brand"
    }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition md:left-[84px] ${
          light ? "text-white" : scrolled ? "border-b border-ink/10 bg-paper/90 text-ink backdrop-blur" : "text-ink"
        }`}
      >
        <div className="relative flex items-center justify-between gap-3 px-5 py-4 md:justify-end md:px-12 md:py-6">
          {/* Desktop: page buttons in the centre of the bar */}
          <nav aria-label="Pages" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:flex">
            {pages.map(([label, href]) => (
              <Link key={href} href={href} aria-current={here === href ? "page" : undefined} data-cursor-light={here === href ? "" : undefined} className={tab(here === href)}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile: the side ribbon lives here (dot, brand, 01/01, 35MM, A24+, 24FPS).
              Fixed 40px row: the dot stays centred, the title sits on the dot's line, the meta line hangs below. */}
          <Link href="/" onClick={() => setOpen(false)} className="flex h-10 min-w-0 items-start gap-3 md:hidden">
            <span className="mt-[15px] h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
            <span className="mt-[13px] min-w-0">
              <span className="block font-display text-[9px] font-extrabold uppercase leading-[14px] tracking-[0.08em] max-[339px]:text-[8px] max-[339px]:tracking-[0.05em] min-[380px]:text-[10px] min-[380px]:tracking-[0.1em] min-[400px]:text-[11px] min-[400px]:tracking-[0.15em]">
                Brands on Steroids
              </span>
              <span className="mt-1.5 block font-mono text-[9px] uppercase leading-[12px] tracking-[0.2em] opacity-70">
                01/01 · 35MM · A24+ · <span className="text-brand">24FPS</span>
              </span>
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden items-center gap-8 md:flex lg:gap-12">
            <a href={micro ? "#catalogue" : "#work"} className={link}>Work</a>
            <a href="#about" className={link}>Studio</a>
            <button
              onClick={toggleSound}
              aria-pressed={sound}
              className={`items-center gap-2 rounded-full border border-ink/20 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink hover:border-brand ${micro ? "hidden lg:flex" : "hidden"}`}
            >
              <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                <i className={`w-[2px] bg-ink ${sound ? "h-2 animate-pulse" : "h-1"}`} />
                <i className={`w-[2px] bg-emerald-500 ${sound ? "h-3 animate-pulse" : "h-2"}`} />
                <i className={`w-[2px] bg-ink ${sound ? "h-2 animate-pulse" : "h-1"}`} />
              </span>
              Sound {sound ? "on" : "off"}
            </button>
          </nav>

          {/* Mobile: speaker toggle + hamburger */}
          <div className="flex shrink-0 items-center md:hidden">
            <button
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={sound ? "Turn sound off" : "Turn sound on"}
              className={micro ? "grid h-10 w-10 place-items-center" : "hidden"}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5z" />
                {sound ? (
                  <>
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                  </>
                ) : (
                  <path d="m16 9 5 6M21 9l-5 6" />
                )}
              </svg>
            </button>
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              aria-expanded={open}
              className="relative h-10 w-10"
            >
              <span className={`absolute left-2 right-2 h-[2px] bg-current transition ${open ? "top-1/2 rotate-45" : "top-[14px]"}`} />
              <span className={`absolute left-2 right-2 h-[2px] bg-current transition ${open ? "top-1/2 -rotate-45" : "top-[24px]"}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-page mobile menu (sits under the header bar so the speaker and X stay clickable) */}
      {open && (
        <div
          data-cursor-light
          className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-ink/90 px-6 pb-10 pt-24 text-white backdrop-blur-xl md:hidden"
        >
          <div className="flex gap-2">
            {pages.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={here === href ? "page" : undefined}
                className={`flex-1 border px-3 py-3 text-center font-display text-[11px] font-bold uppercase tracking-[0.18em] ${
                  here === href ? "border-brand bg-brand text-white" : "border-white/40 text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <nav className="my-auto flex flex-col gap-6 py-8">
            {menu.map(([label, href], i) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="h-display flex items-baseline gap-4 text-2xl hover:text-brand"
              >
                <span className="font-mono text-[11px] font-medium tracking-widest text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
