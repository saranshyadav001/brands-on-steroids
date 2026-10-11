"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Player from "./Player";

// Full-page watch screen: back button, player, and a side panel with
// breadcrumb, title, plot (More/Less), chips, like / save / share,
// episode range tabs, "All Episodes", and the episode grid.

const CHUNK = 50;
const count = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(n));

const Svg = ({ children, size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {children}
  </svg>
);
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

function useFlag(key) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      setOn(localStorage.getItem(key) === "1");
    } catch {}
  }, [key]);
  const flip = () =>
    setOn((v) => {
      try {
        localStorage.setItem(key, v ? "0" : "1");
      } catch {}
      return !v;
    });
  return [on, flip];
}

// `siblings` = every single-video title in the catalogue. When the open title has
// only one video, the grid lists those titles instead (1, 2, 3 ...) so the viewer
// can move through the whole catalogue, and the next one plays automatically.
export default function WatchModal({ series, index, onSelect, onClose, siblings = [], onJump }) {
  const ep = series.episodes[index];
  const box = useRef(null);
  const [more, setMore] = useState(false);
  const [all, setAll] = useState(false);
  const [note, setNote] = useState("");
  const [liked, flipLike] = useFlag(`bos:like:${series.slug}`);
  const [saved, flipSave] = useFlag(`bos:save:${series.slug}`);

  const solo = series.episodes.length === 1 && siblings.length > 1 && siblings.some((x) => x.slug === series.slug);
  const cur = solo ? siblings.findIndex((x) => x.slug === series.slug) : index;
  const items = useMemo(
    () =>
      solo
        ? siblings.map((x, i) => ({ e: { key: x.slug, num: i + 1, short: String(i + 1), label: x.title, sub: x.genre, locked: false }, i }))
        : series.episodes.map((e, i) => ({ e, i })),
    [solo, siblings, series]
  );
  const chunks = useMemo(() => {
    const out = [];
    for (let i = 0; i < items.length; i += CHUNK) out.push(items.slice(i, i + CHUNK));
    return out;
  }, [items]);
  const [tab, setTab] = useState(Math.floor(cur / CHUNK));
  useEffect(() => {
    setTab(Math.floor(cur / CHUNK));
    setMore(false);
  }, [cur, series.slug]);

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
    const target = items[i]?.e;
    if (!target) return;
    if (target.locked) return setNote(`${target.label} is locked. Contact us for full access.`);
    if (solo) onJump?.(siblings[i].slug);
    else onSelect(i);
    setAll(false);
  };
  const step = (dir) => {
    for (let i = cur + dir; i >= 0 && i < items.length; i += dir) if (!items[i].e.locked) return i;
    return -1;
  };
  const prev = step(-1);
  const next = step(1);

  async function share() {
    const url = window.location.href;
    const title = series.episodes.length === 1 ? series.title : `${ep.label} - ${series.title}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setNote("Link copied to clipboard");
      }
    } catch (e) {
      if (e?.name !== "AbortError") setNote("Could not share - copy the link from the address bar");
    }
  }

  const heading = series.episodes.length === 1 ? series.title : `${ep.label} - ${series.title}`;
  const plot = ep.plot || series.plot;
  const chips = [...series.cast, ...series.tags];
  const rangeLabel = (c) => (c.length === 1 ? c[0].e.short : `${c[0].e.num} - ${c[c.length - 1].e.num}`);

  const grid = (items) => (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
      {items.map(({ e, i }) => {
        const active = i === cur;
        return (
          <button
            key={e.key}
            type="button"
            onClick={() => go(i)}
            aria-current={active ? "true" : undefined}
            title={e.label}
            aria-label={e.locked ? `${e.label} (locked)` : e.label}
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

  const action = "flex flex-1 flex-col items-center gap-3 py-1 text-white/85 transition hover:text-brand";

  return (
    <div
      ref={box}
      tabIndex={-1}
      data-cursor-light
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-[100] flex flex-col bg-ink font-sans text-white outline-none lg:flex-row"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Back"
        className="absolute left-4 top-4 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-ink/60 text-white backdrop-blur transition hover:border-brand hover:bg-brand lg:left-8 lg:top-7 lg:h-16 lg:w-16"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 12H4M10 6l-6 6 6 6" />
        </svg>
      </button>

      {/* player */}
      <div className="flex h-[56vh] shrink-0 items-center justify-center lg:h-full lg:min-w-0 lg:flex-1">
        <Player
          src={ep.src}
          title={heading}
          onEnded={() => next >= 0 && go(next)}
          onPrev={prev >= 0 ? () => go(prev) : undefined}
          onNext={next >= 0 ? () => go(next) : undefined}
        />
      </div>

      {/* side panel */}
      <aside className="min-h-0 flex-1 overflow-y-auto border-t border-white/10 px-5 pb-10 pt-6 lg:w-[540px] lg:flex-none lg:border-l lg:border-t-0 lg:px-9 lg:pt-8 xl:w-[580px]">
        {all ? (
          <>
            <button type="button" onClick={() => setAll(false)} className="mb-6 flex items-center gap-3 font-display text-lg font-extrabold uppercase hover:text-brand">
              <span aria-hidden="true">‹</span> All Episodes <span className="font-mono text-[11px] font-normal tracking-widest text-white/50">[ {items.length} ]</span>
            </button>
            {solo ? (
              <ul className="space-y-2">
                {items.map(({ e, i }) => (
                  <li key={e.key}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={i === cur ? "true" : undefined}
                      className={`flex w-full items-center gap-4 border px-4 py-3 text-left transition ${
                        i === cur ? "border-brand bg-brand" : "border-white/15 bg-white/[0.04] hover:border-brand"
                      }`}
                    >
                      <span className="w-6 shrink-0 text-center font-mono text-[11px] text-white/60">{String(e.short).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1 truncate font-display text-sm font-extrabold uppercase">{e.label}</span>
                      {e.sub && <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/60">{e.sub}</span>}
                      {i === cur && <Bars />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              grid(items)
            )}
          </>
        ) : (
          <>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
              <button type="button" onClick={onClose} className="hover:text-white">
                Home
              </button>
              <span>/</span>
              <button type="button" onClick={() => !solo && go(0)} className="hover:text-white">
                {series.title}
              </button>
              {series.episodes.length > 1 && (
                <>
                  <span>/</span>
                  <span className="text-white">{ep.label}</span>
                </>
              )}
            </nav>

            <h2 className="h-display mt-6 text-3xl md:text-4xl">{heading}</h2>
            {(ep.title || series.genre) && <p className="label mt-4">[ {ep.title || series.genre} ]</p>}

            {plot && (
              <div className="mt-7">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">{series.episodes.length === 1 ? "Plot" : `Plot of ${ep.label}`}</h3>
                <p className={`mt-3 border-l-2 border-brand pl-4 text-base leading-relaxed text-white/70 ${more ? "" : "line-clamp-3"}`}>{plot}</p>
                {plot.length > 140 && (
                  <button type="button" onClick={() => setMore((v) => !v)} className="mt-2 pl-4 font-mono text-[11px] uppercase tracking-widest text-brand hover:text-white">
                    {more ? "Less" : "More"}
                  </button>
                )}
              </div>
            )}

            {chips.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {chips.map((c) => (
                  <li key={c} className="border border-white/20 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-white/80">
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-7 flex border-y border-white/15 py-5">
              <button type="button" onClick={flipLike} aria-pressed={liked} className={`${action} ${liked ? "!text-brand" : ""}`}>
                <Svg>
                  <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.200 3 4.500 6.600 4.500c2 0 3.600 1 5.400 3 1.800-2 3.400-3 5.400-3 3.600 0 5.700 3.700 4.200 7.200C19.500 16.400 12 21 12 21z" />
                </Svg>
                <span className="font-mono text-[11px] uppercase tracking-widest">{series.likes != null ? count(series.likes + (liked ? 1 : 0)) : liked ? "Liked" : "Like"}</span>
              </button>
              <button type="button" onClick={flipSave} aria-pressed={saved} className={`${action} ${saved ? "!text-brand" : ""}`}>
                <Svg>
                  <path d="M6 3h12v18l-6-4.500L6 21V3z" />
                </Svg>
                <span className="font-mono text-[11px] uppercase tracking-widest">{series.saves != null ? count(series.saves + (saved ? 1 : 0)) : saved ? "Saved" : "Save"}</span>
              </button>
              <button type="button" onClick={share} className={action}>
                <Svg>
                  <path d="M14 4l8 7.500-8 7.500v-4.500C8 14.500 4.500 16.300 2 20c.800-6 4-10.500 12-11.500V4z" />
                </Svg>
                <span className="font-mono text-[11px] uppercase tracking-widest">Share</span>
              </button>
            </div>

            <div className="mt-7 flex items-center gap-6 font-mono text-sm tracking-widest">
              {chunks.map((c, i) => (
                <button key={i} type="button" onClick={() => setTab(i)} className={i === tab ? "text-brand" : "text-white/40 hover:text-white"}>
                  {rangeLabel(c)}
                </button>
              ))}
              <span className="flex-1" />
              {items.length > 1 && (
                <button type="button" onClick={() => setAll(true)} className="flex items-center gap-1 text-[11px] uppercase text-white/60 hover:text-brand">
                  All Episodes <span aria-hidden="true">›</span>
                </button>
              )}
            </div>
            <div className="mt-4">{grid(chunks[tab] || chunks[0])}</div>
          </>
        )}
      </aside>

      {note && (
        <div role="status" className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 bg-paper px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-ink shadow-xl">
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
