import { studio, team } from "@/data/site";

export default function About() {
  const solo = team.length === 1;
  return (
    <section id="about" className="border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        {/* the usual checklist (Syne), struck through, beside what the studio does instead (hand-written, Caveat, pink) */}
        <div className="mb-20 grid gap-10 border-b border-ink/10 pb-20 md:mb-24 md:pb-24 lg:grid-cols-2 lg:items-center lg:gap-16">
          <ol>
            {studio.struck.map((t, i) => (
              <li key={t} className="flex items-baseline gap-4 border-t border-ink/10 py-2.5 first:border-t-0">
                <span className="w-5 shrink-0 font-mono text-[10px] font-medium text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-sm font-extrabold uppercase tracking-[0.04em] text-ink/35 line-through decoration-brand decoration-2 md:text-base">{t}</span>
              </li>
            ))}
          </ol>
          <p className="font-hand text-[clamp(2rem,8.6vw,3.25rem)] font-semibold leading-[1.05] text-brand lg:text-[clamp(2.25rem,4.3vw,4.25rem)]">{studio.line}</p>
        </div>

        <p className="label mb-4">[ About ]</p>
        <h2 className="h-display text-4xl md:text-6xl">
          {solo ? "The mind behind " : "The minds behind "}
          <span className="text-brand">the frame.</span>
        </h2>
        <div className={solo ? "mt-14" : "mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3"}>
          {team.map((m) => (
            <div key={m.name} className={solo ? "flex max-w-3xl flex-col gap-8 sm:flex-row sm:items-center sm:gap-10" : ""}>
              <div className="h-44 w-44 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-ink/10">
                {m.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} draggable={false} className="h-full w-full object-cover object-center" />
                )}
              </div>
              <div className={solo ? "" : "mt-5"}>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand">{m.role}</p>
                <p className="mt-1 font-display text-2xl font-extrabold uppercase md:text-3xl">{m.name}</p>
                {m.focus && <p className="mt-3 font-medium text-ink">{m.focus}</p>}
                <p className="mt-2 text-ink/60">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
