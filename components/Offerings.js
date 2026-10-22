import Link from "next/link";
import { offerings } from "@/data/site";
import LineIcon from "./LineIcon";

// Home page "What we make": three service cards. Words in data/site.js (offerings).
export default function Offerings() {
  return (
    <section id="what-we-make" className="scroll-mt-20 border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        <p className="label mb-4 flex items-center gap-2">
          <span aria-hidden="true" className="h-2 w-2 bg-brand" /> {offerings.label}
        </p>
        <h2 className="h-display section-title">
          {offerings.line} <span className="text-brand">{offerings.accent}</span>
        </h2>
        <p className="mt-8 max-w-2xl border-l-2 border-brand pl-4 text-lg text-ink/70">{offerings.text}</p>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {offerings.cards.map(([title, text, href, more, icon]) => (
            <Link key={title} href={href} data-cursor="Open" className="corners group flex min-h-[320px] flex-col bg-white p-7 transition md:p-8">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-ink/25 text-ink transition group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                <LineIcon name={icon} />
              </span>
              <h3 className="h-display mt-8 text-2xl lg:text-3xl">{title}</h3>
              <p className="mt-4 text-ink/70">{text}</p>
              <span className="mt-auto flex items-center gap-4 pt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60 transition group-hover:text-brand">
                {more}
                <span aria-hidden="true" className="h-px flex-1 bg-ink/15 transition group-hover:bg-brand" />
                <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
