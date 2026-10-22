import { pipeline } from "@/data/site";
import LineIcon from "./LineIcon";

// "Full-stack production with GenAI": the three stages. Words in data/site.js (pipeline).
export default function Pipeline() {
  return (
    <section id="process" className="scroll-mt-20 border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label mb-4">[ The pipeline ]</p>
          <h2 className="h-display section-title side">
            {pipeline.line} <span className="text-brand">{pipeline.accent}</span>
          </h2>
          <p className="mt-8 max-w-xl border-l-2 border-brand pl-4 text-lg text-ink/70">{pipeline.text}</p>
          <p className="hand mt-6 -rotate-1 text-2xl">script → screen, one crew</p>
        </div>

        <ol className="space-y-8">
          {pipeline.stages.map(([title, text, icon], i) => (
            <li key={title} className="corners group flex min-w-0 flex-col gap-5 bg-white p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-7 md:p-9">
              <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-3">
                <span className="grid h-16 w-16 place-items-center rounded-full border border-ink/20 text-ink transition group-hover:border-brand group-hover:text-brand md:h-20 md:w-20">
                  <LineIcon name={icon} size={32} />
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-brand">STAGE {String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="min-w-0">
                <h3 className="h-display break-words text-xl sm:text-2xl md:text-3xl">{title}</h3>
                <p className="mt-3 text-ink/70 md:text-lg">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
