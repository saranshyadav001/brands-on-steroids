import { clients } from "@/data/site";

// "Trusted by": a wall of the brands you have worked with (data/site.js, clients).
// Hidden while the list is empty.
export default function Clients() {
  if (!clients.length) return null;
  return (
    <section id="clients" className="border-t border-ink/10 px-5 py-20 md:px-12">
      <div className="max-w-7xl">
        <p className="label mb-10">[ Trusted by ]</p>
        <ul className="grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-3 lg:grid-cols-6">
          {clients.map((c) => {
            const [name, logo] = Array.isArray(c) ? c : [c];
            return (
              <li key={name} className="grid min-h-[96px] place-items-center bg-paper px-4 py-6 text-center">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={name} className="max-h-10 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                ) : (
                  <span className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-ink/60">{name}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
