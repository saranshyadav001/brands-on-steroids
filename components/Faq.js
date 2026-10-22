import { faq } from "@/data/site";

// Questions and answers, opened one at a time. Also given to Google as FAQ data.
// Words in data/site.js (faq).
export default function Faq() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <section id="faq" className="scroll-mt-20 border-t border-ink/10 px-5 py-24 md:px-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      <div className="grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label mb-4">[ FAQ ]</p>
          <h2 className="h-display section-title side">
            Questions, <span className="text-brand">answered.</span>
          </h2>
          <p className="mt-8 max-w-md text-lg text-ink/70">
            Can&apos;t find what you need?{" "}
            <a href="#contact" data-cursor="Talk" className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4 hover:text-brand">
              Talk to the crew →
            </a>
          </p>
        </div>

        <div className="space-y-5">
          {faq.map(([q, a], i) => (
            <details key={q} name="faq" className="corners group bg-white">
              <summary data-cursor="Read" className="flex cursor-pointer items-start gap-5 p-6 md:p-7">
                <span className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-display flex-1 text-lg normal-case leading-tight tracking-normal md:text-2xl">{q}</span>
                <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/20 text-lg leading-none transition group-open:rotate-45 group-open:border-brand group-open:bg-brand group-open:text-white">
                  +
                </span>
              </summary>
              <p className="-mt-2 px-6 pb-7 pl-[3.6rem] text-ink/70 md:px-7 md:pl-[4.1rem] md:text-lg">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
