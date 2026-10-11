import { services } from "@/data/site";

export default function Services() {
  return (
    <section id="services" className="border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        <p className="label mb-4">[ Services ]</p>
        <h2 className="h-display mb-12 text-4xl md:text-6xl">Four ways to <span className="text-brand">work with us.</span></h2>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <div key={s.n} id={s.id} className="min-w-0 scroll-mt-24 border border-ink/10 bg-white p-6 transition hover:border-brand md:p-8">
              <p className="label">[ {s.n} ]</p>
              <h3 className="h-display mt-3 break-words text-xl sm:text-2xl lg:text-3xl">{s.title}</h3>
              <p className="mt-5 border-l-2 border-brand pl-4 text-ink/70">{s.text}</p>
              <ul className="mt-6 space-y-2 font-mono text-xs text-ink/80">
                {s.points.map((p) => (
                  <li key={p}><span className="mr-2 text-brand">→</span>{p}</li>
                ))}
              </ul>
              <a href="#contact" className="mt-8 inline-block font-mono text-xs uppercase tracking-widest text-brand hover:text-ink">Inquire →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
