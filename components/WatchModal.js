"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Player from "./Player";

// Full-page watch screen: back button, player, and a side panel with
// breadcrumb, title, hook, plot (More/Less), "Discuss this series", genre chips, details,
// the episode grid (range tabs + "All Episodes")
// and the rest of the catalogue. When a video ends the next episode plays,
// and after the last episode the next title starts.

const CHUNK = 50;
const Lock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 9V7A5 5 0 0 0 7 7v2H5v12h14V9h-2zM9 7a3 3 0 0 1 6 0v2H9V7z" />
  </svg>
);
const Bars = () => (
  <span className="eq" aria-hidden="true">
    <i />
    <i />
    <i />
  </span>
);

const paras = (t) => t.split(/\n{2,}/).filter(Boolean);

export default function WatchModal({ series, index, onSelect, onClose, catalogue = [], onJump, moreLabel = "More from the catalogue" }) {
  const ep = series.episodes[index];
  const box = useRef(null);
  const panel = useRef(null);
  const [more, setMore] = useState(false);
  const [all, setAll] = useState(false);
  const [note, setNote] = useState("");

  const multi = series.episodes.length > 1;
  const items = useMemo(() => series.episodes.map((e, i) => ({ e, i })), [series]);
  const chunks = useMemo(() => {
    const out = [];
    for (let i = 0; i < items.length; i += CHUNK) out.push(items.slice(i, i + CHUNK));
    return out;
  }, [items]);
  const [tab, setTab] = useState(Math.floor(index / CHUNK));
  useEffect(() => {
    setTab(Math.floor(index / CHUNK));
  }, [index, series.slug]);
  useEffect(() => {
    setMore(false);
    setAll(false);
    panel.current?.scrollTo({ top: 0 });
  }, [series.slug]);

  // lock page scroll, pause the hero video, Esc closes
  useEffect(() => {
    const hero = document.getElementById("hero-video");
    const heroWasPlaying = hero && !hero.paused;
    if (heroWasPlaying) hero.pause();
    document.body.style.overflow = "hidden";
    box.current?.focus(); // keyboard shortcuts work straight away
    const onKey = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      if (heroWasPlaying) hero.play().catch(() => {});
    };
  }, [onClose]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(""), 3200);
    return () => clearTimeout(t);
  }, [note]);

  const go = (i) => {
    const target = series.episodes[i];
    if (!target) return;
    if (target.locked) return setNote(`${target.label} is locked. Contact us for full access.`);
    onSelect(i);
    setAll(false);
  };

  // previous / next: through this title's episodes first, then on to the neighbouring title
  const here = catalogue.findIndex((x) => x.slug === series.slug);
  const stepEp = (dir) => {
    for (let i = index + dir; i >= 0 && i < series.episodes.length; i += dir) if (!series.episodes[i].locked) return i;
    return -1;
  };
  const move = (dir) => {
    const i = stepEp(dir);
    if (i >= 0) return () => onSelect(i);
    const other = here >= 0 ? catalogue[here + dir] : null;
    return other ? () => onJump?.(other.slug) : undefined;
  };
  const prev = move(-1);
  const next = move(1);

  // "Discuss this series": close the popup, go to the contact form and start the message
  const discuss = () => {
    const title = series.title;
    onClose();
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("bos-discuss", { detail: title }));
    }, 250);
  };

  const chips = [...(series.genres || []), ...series.cast, ...series.tags];
  const plot = series.plot || "";
  const long = plot.length > 260;
  const epText = ep.title || ep.tagline || ep.plot;
  const rangeLabel = (c) => (c.length === 1 ? c[0].e.short : `${c[0].e.num} - ${c[c.length - 1].e.num}`);
  const mono = "font-mono text-[11px] uppercase tracking-[0.18em]";

  const grid = (list) => (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
      {list.map(({ e, i }) => {
        const active = i === index;
        return (
          <button
            key={e.key}
            type="button"
            onClick={() => go(i)}
            title={e.title ? `${e.label}: ${e.title}` : e.label}
            aria-current={active ? "true" : undefined}
            aria-label={e.locked ? `${e.label} (locked)` : e.label}
            data-cursor={e.locked ? "Locked" : "Play"}
            className={`relative grid h-14 place-items-center border font-mono text-[13px] transition ${
              active ? "border-brand bg-brand font-medium text-white" : "border-white/15 bg-white/[0.04] text-white/85 hover:border-brand hover:text-brand"
            } ${e.locked ? "text-white/60" : ""}`}
          >
            {e.short}
            {e.locked && (
              <span className="absolute right-1.5 top-1.5 text-white/45">
                <Lock />
              </span>
            )}
            {active && (
              <span className="absolute bottom-1.5 right-1.5">
                <Bars />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      ref={box}
      tabIndex={-1}
      data-cursor-light
      role="dialog"
      aria-modal="true"
      aria-label={series.title}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-[100] flex flex-col bg-ink font-sans text-white outline-none lg:flex-row"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Back"
        data-cursor="Back"
        className="absolute left-4 top-4 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-ink/60 text-white backdrop-blur transition hover:border-brand hover:bg-brand lg:left-8 lg:top-7 lg:h-16 lg:w-16"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 12H4M10 6l-6 6 6 6" />
        </svg>
      </button>

      {/* player */}
      <div className="flex h-[52vh] shrink-0 items-center justify-center bg-black lg:h-full lg:min-w-0 lg:flex-1">
        <Player src={ep.src} title={series.title} onEnded={() => next?.()} onPrev={prev} onNext={next} />
      </div>

      {/* side panel */}
      <aside
        ref={panel}
        className="min-h-0 flex-1 overflow-y-auto border-t border-white/10 px-5 pb-12 pt-6 lg:w-[540px] lg:flex-none lg:border-l lg:border-t-0 lg:px-9 lg:pt-8 xl:w-[600px]"
      >
        {all ? (
          <>
            <button type="button" onClick={() => setAll(false)} className="mb-6 flex items-center gap-3 font-display text-lg font-extrabold uppercase hover:text-brand">
              <span aria-hidden="true">‹</span> All Episodes <span className="font-mono text-[11px] font-normal tracking-widest text-white/50">[ {items.length} ]</span>
            </button>
            {grid(items)}
          </>
        ) : (
          <>
            <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-x-2 ${mono} text-white/50`}>
              <button type="button" onClick={onClose} className="uppercase tracking-[0.18em] hover:text-white">
                Home
              </button>
              <span>/</span>
              <button type="button" onClick={() => multi && go(0)} className="max-w-[16rem] truncate uppercase tracking-[0.18em] hover:text-white">
                {series.title}
              </button>
              {multi && (
                <>
                  <span>/</span>
                  <span className="text-white">{ep.label}</span>
                </>
              )}
            </nav>

            <h2 className="h-display mt-6 break-words text-2xl leading-[1.02] md:text-[2rem]">{series.title}</h2>
            <p className="label mt-4">
              [ {[ep.label, series.genre].filter(Boolean).join(" · ")} ]
            </p>

            {series.logline && <p className="mt-6 text-lg font-medium leading-snug text-white">{series.logline}</p>}

            {plot && (
              <div className="mt-6">
                <h3 className={`${mono} text-white/50`}>Plot</h3>
                <div className={`mt-3 space-y-3 border-l-2 border-brand pl-4 text-[15px] leading-relaxed text-white/70 ${more || !long ? "" : "line-clamp-4"}`}>
                  {more || !long ? paras(plot).map((t, i) => <p key={i}>{t}</p>) : plot.replace(/\n+/g, " ")}
                </div>
                {long && (
                  <button type="button" onClick={() => setMore((v) => !v)} className={`mt-2 pl-4 ${mono} tracking-widest text-brand hover:text-white`}>
                    {more ? "Less" : "More"}
                  </button>
                )}
              </div>
            )}

            <button type="button" onClick={discuss} data-cursor="Talk" className="btn btn-solid mt-7 hover:!bg-white hover:!text-ink">
              Discuss this series <span aria-hidden="true">→</span>
            </button>

            {epText && (
              <div className="mt-6 border border-white/15 bg-white/[0.04] p-4">
                <p className={`${mono} text-brand`}>
                  {ep.label}
                  {ep.title ? ` · ${ep.title}` : ""}
                </p>
                {ep.tagline && <p className="mt-2 font-medium text-white">{ep.tagline}</p>}
                {ep.plot && (
                  <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/65">
                    {paras(ep.plot).map((t, i) => (
                      <p key={i}>{t}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {chips.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <li key={c} className="border border-white/20 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-white/80">
                    {c}
                  </li>
                ))}
              </ul>
            )}

            {(series.facts?.length > 0 || series.notes?.length > 0) && (
              <dl className="mt-6 border-t border-white/10">
                {(series.facts || []).map((f) => (
                  <div key={f.k} className="flex gap-4 border-b border-white/10 py-2.5">
                    <dt className="w-28 shrink-0 font-mono text-[10px] uppercase leading-5 tracking-widest text-white/45">{f.k}</dt>
                    <dd className="min-w-0 flex-1 text-sm text-white/85">{f.v}</dd>
                  </div>
                ))}
                {(series.notes || []).map((t) => (
                  <div key={t} className="border-b border-white/10 py-2.5 font-mono text-[10px] uppercase tracking-widest text-brand">
                    {t}
                  </div>
                ))}
              </dl>
            )}

            {multi && (
              <section className="mt-7">
                <div className="flex items-center gap-6 font-mono text-sm tracking-widest">
                  <span className={`${mono} text-white/50`}>Episodes</span>
                  {chunks.map((c, i) => (
                    <button key={i} type="button" onClick={() => setTab(i)} className={i === tab ? "text-brand" : "text-white/40 hover:text-white"}>
                      {rangeLabel(c)}
                    </button>
                  ))}
                  <span className="flex-1" />
                  <button type="button" onClick={() => setAll(true)} className="flex items-center gap-1 text-[11px] uppercase text-white/60 hover:text-brand">
                    All Episodes <span aria-hidden="true">›</span>
                  </button>
                </div>
                <div className="mt-4">{grid(chunks[tab] || chunks[0])}</div>
              </section>
            )}

            {catalogue.length > 1 && (
              <section className="mt-10">
                <h3 className={`${mono} text-white/50`}>[ {moreLabel} ]</h3>
                <ul className="mt-4 space-y-2">
                  {catalogue.map((x, i) => {
                    const active = x.slug === series.slug;
                    return (
                      <li key={x.slug}>
                        <button
                          type="button"
                          onClick={() => !active && onJump?.(x.slug)}
                          aria-current={active ? "true" : undefined}
                          data-cursor="Play"
                          className={`flex w-full items-center gap-4 border px-4 py-3 text-left transition ${
                            active ? "border-brand bg-brand" : "border-white/15 bg-white/[0.04] hover:border-brand"
                          }`}
                        >
                          <span className="w-6 shrink-0 text-center font-mono text-[11px] text-white/60">{String(i + 1).padStart(2, "0")}</span>
                          <span className="min-w-0 flex-1 truncate font-display text-[13px] font-extrabold uppercase">{x.title}</span>
                          <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/60 sm:block">
                            {x.episodes.length > 1 ? `${x.episodes.length} episodes` : x.genre}
                          </span>
                          {active && <Bars />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </aside>

      {note && (
        <div
          role="status"
          className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 bg-paper px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-ink shadow-xl"
        >
          {note}
          {note.includes("locked") && (
            <a href="#contact" onClick={onClose} className="text-brand underline">
              Contact
            </a>
          )}
        </div>
      )}
    </div>
  );
}
