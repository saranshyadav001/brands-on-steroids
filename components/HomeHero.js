import { home } from "@/data/site";

// Home page hero: paper background (the site-wide dot mesh shows through), editorial headline with hand-written notes.
// All the words live in data/site.js (export const home).

export default function HomeHero() {
  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden px-5 pb-8 pt-24 md:px-12 md:pt-28">
      {/* slate line */}
      <div className="relative flex items-center justify-between gap-4 border-b border-ink/10 pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
        <p className="min-w-0 truncate">
          <span className="text-brand">+</span> <span className="font-medium text-ink">Brands on Steroids</span>
          <span className="hidden sm:inline"> &nbsp;/&nbsp; Frame: 01.A24 // Aspect 2.39:1</span>
        </p>
        <p className="shrink-0">
          <span className="hidden sm:inline">Take 104 &nbsp;—&nbsp; </span>
          <span className="font-medium text-ink">Director&apos;s cut</span> <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
        </p>
      </div>

      <div className="relative my-auto py-10">
        <p className="hand mb-3 -rotate-1 text-xl md:text-2xl">✎ {home.note}</p>

        <h1 className="h-display home-title">
          <span className="block">{home.line1}</span>
          <span className="relative block w-fit text-ink/25">
            {home.struck}
            {/* hand-drawn strike-through */}
            <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute -left-[3%] top-[38%] h-[0.22em] w-[106%] overflow-visible text-brand">
              <path d="M0 8 C 30 4, 62 3, 100 1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="hand absolute -top-[0.35em] right-[2%] rotate-2 whitespace-nowrap text-[0.2em] normal-case leading-none tracking-normal">{home.struckNote}</span>
          </span>
          <span className="home-title-split block">{home.line2}</span>
          <span className="relative block w-fit text-brand">
            {home.accent}
            {/* hand-drawn ring */}
            <svg aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute left-[36%] top-[4%] h-[92%] w-[50%] overflow-visible text-brand">
              <path d="M52 3 C 20 0, 2 9, 3 21 C 4 34, 34 39, 62 36 C 90 33, 101 22, 95 13 C 89 5, 60 2, 30 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        </h1>

        <p className="hand mt-3 -rotate-1 text-lg !text-ink/70 md:text-xl">↗ {home.hand}</p>
        <div className="mt-2 flex max-w-2xl gap-4">
          <span aria-hidden="true" className="mt-[0.85em] h-[2px] w-9 shrink-0 bg-brand" />
          <p className="text-lg text-ink/70 md:text-xl">
            <strong className="font-semibold text-ink">{home.lead}</strong> {home.text}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a href="#contact" data-cursor-light data-cursor="Create" className="group inline-flex items-center gap-4 bg-ink px-6 py-5 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-brand md:px-9 md:text-sm">
            {home.cta} <span className="text-brand transition group-hover:text-white">→</span>
          </a>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
            <span className="text-brand">✦</span> {home.strip.join(" · ")}
          </p>
        </div>
      </div>

      {/* category chips */}
      <ul className="relative flex flex-wrap gap-2 border-t border-ink/10 pt-5">
        {home.chips.map(([label, href], i) => (
          <li key={label}>
            <a href={href} data-cursor="Explore" className="flex items-center gap-2 border border-ink/15 px-3 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition hover:border-ink hover:bg-ink hover:text-white">
              <span className="font-mono text-[9px] font-medium text-brand">{String(i + 1).padStart(2, "0")}</span>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
