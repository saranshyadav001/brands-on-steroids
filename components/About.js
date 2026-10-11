import { team } from "@/data/site";

export default function About() {
  return (
    <section id="about" className="border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        <p className="label mb-4">[ About ]</p>
        <h2 className="h-display text-4xl md:text-6xl">The minds behind <span className="text-brand">the frame.</span></h2>
        <p className="mt-8 max-w-2xl border-l-2 border-brand pl-4 text-lg text-ink/70">A short line about the studio goes here.</p>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.name}>
              <div className="h-40 w-40 overflow-hidden rounded-full border border-ink/10 bg-ink/10">
                {m.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-brand">{m.role}</p>
              <p className="font-display text-2xl font-extrabold uppercase">{m.name}</p>
              <p className="mt-2 text-sm text-ink/60">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
