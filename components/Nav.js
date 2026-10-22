"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const link = "whitespace-nowrap font-display text-xs font-bold uppercase tracking-[0.2em] hover:text-brand xl:text-sm xl:tracking-[0.3em]";

// The two pages. The one you are on is shown in pink.
// Desktop: "BOS" (the home button) sits in the centre of the bar, "Micro Drama" just before "Work" on the right.
const pages = [
  ["Home", "/"],
  ["Micro Drama", "/micro-drama"],
];

// Mobile full-page menu, per page
const menus = {
  "/": [
    ["What we make", "#what-we-make"],
    ["Ad films", "#work"],
    ["The pipeline", "#process"],
    ["Studio", "#about"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"],
  ],
  "/micro-drama": [
    ["Catalogue", "#catalogue"],
    ["On-demand production", "#on-demand"],
    ["Bulk AI microdrama", "#bulk-microdrama"],
    ["AI branded content", "#branded-content"],
    ["Sponsored microdrama series", "#sponsored-series"],
    ["The pipeline", "#process"],
    ["Studio", "#about"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"],
  ],
};

// Sound on / off for the hero video (same icon on phone and desktop)
const Speaker = ({ on }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" />
    {on ? (
      <>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </>
    ) : (
      <path d="m16 9 5 6M21 9l-5 6" />
    )}
  </svg>
);

export default function Nav() {
  const pathname = usePathname() || "/";
  const here = pathname.startsWith("/micro-drama") ? "/micro-drama" : "/";
  const micro = here === "/micro-drama";
  const menu = menus[here];
  // on a series page (/micro-drama/<title>) the section links lead back to the micro-drama page
  const at = (hash) => (pathname === here ? hash : `${here}${hash}`);
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
  const page = (active) => `${link} ${active ? "text-brand" : ""}`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition md:left-[84px] ${
          light ? "text-white" : scrolled ? "border-b border-ink/10 bg-paper/90 text-ink backdrop-blur" : "text-ink"
        }`}
      >
        <div className="relative flex items-center justify-between gap-3 px-5 py-4 md:justify-end md:px-12 md:py-6">
          {/* Desktop: "BOS" = home, in the centre of the page (the bar starts after the 84px side ribbon) */}
          <Link
            href="/"
            aria-current={!micro ? "page" : undefined}
            aria-label="BOS - home"
            data-cursor="Home"
            className={`absolute left-12 top-1/2 hidden -translate-y-1/2 font-display text-xl font-extrabold uppercase leading-none tracking-[0.12em] hover:text-brand md:block lg:left-[calc(50vw-84px)] lg:-translate-x-1/2 xl:text-2xl ${!micro ? "text-brand" : ""}`}
          >
            BOS
          </Link>

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
          <nav className="hidden items-center gap-5 md:flex xl:gap-8 2xl:gap-12">
            <Link href="/micro-drama" data-cursor="Watch" aria-current={micro ? "page" : undefined} className={page(micro)}>
              Micro Drama
            </Link>
            <a href={at(micro ? "#catalogue" : "#work")} data-cursor="View" className={link}>Work</a>
            <a href={at("#about")} data-cursor="Meet" className={link}>Studio</a>
            <button
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={sound ? "Turn sound off" : "Turn sound on"}
              data-cursor="Sound"
              className={micro ? "grid h-10 w-10 place-items-center hover:text-brand" : "hidden"}
            >
              <Speaker on={sound} />
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
              <Speaker on={sound} />
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
          className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-ink/90 px-6 pb-10 pt-[5.5rem] text-white backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col pt-2">
            {pages.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={here === href ? "page" : undefined}
                className={`flex items-baseline gap-3 border-b border-white/10 py-2.5 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] hover:text-brand ${here === href ? "text-brand" : ""}`}
              >
                <span className="w-5 shrink-0 font-mono text-[9px] font-medium tracking-widest text-brand">{here === href ? "\u25cf" : "\u2192"}</span>
                {label}
              </Link>
            ))}
            <span aria-hidden="true" className="mb-0.5 mt-5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">On this page</span>
            {menu.map(([label, href], i) => (
              <a
                key={href}
                href={at(href)}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-3 border-b border-white/10 py-2.5 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] hover:text-brand"
              >
                <span className="w-5 shrink-0 font-mono text-[9px] font-medium tracking-widest text-brand">
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
