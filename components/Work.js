"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import WatchModal from "./WatchModal";

// Home page "Work" section. The list comes from the server (lib/library.js getWork),
// built from every video in the content folder outside the micro-drama folder.
// Tabs = folders. Tiles take the shape of their video (wide, square or tall).
// Opening one puts ?work=<title> in the address bar, so the browser back button
// closes the popup and a shared link opens the same film.

const POSTER_AT = 2; // second of the video used as the tile picture

const hoverPlay = (e) => e.currentTarget.querySelector("video")?.play().catch(() => {});
const hoverStop = (e) => {
  const v = e.currentTarget.querySelector("video");
  if (!v) return;
  v.pause();
  try {
    v.currentTime = POSTER_AT;
  } catch {}
};

function Tile({ item, n, onOpen }) {
  const [ratio, setRatio] = useState(9 / 16);
  return (
    <button
      onClick={() => onOpen(item)}
      onContextMenu={(e) => e.preventDefault()}
      onMouseEnter={hoverPlay}
      onMouseLeave={hoverStop}
      className="group mb-3 block w-full break-inside-avoid text-left"
    >
      <div
        className="relative overflow-hidden border border-ink/10 bg-gradient-to-b from-ink/30 to-ink/80 transition group-hover:border-brand"
        style={{ aspectRatio: String(ratio) }}
      >
        <video
          src={`${item.episodes[0].src}#t=${POSTER_AT}`}
          loop
          muted
          playsInline
          preload="metadata"
          tabIndex={-1}
          aria-hidden="true"
          disablePictureInPicture
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.videoWidth && v.videoHeight) setRatio(Math.min(1.9, Math.max(0.5, v.videoWidth / v.videoHeight)));
          }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-white/80">FILM {String(n).padStart(2, "0")}</span>
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-brand text-xs text-white">▶</span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-white">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand">{item.genre}</p>
          <p className="line-clamp-3 font-display text-[11px] font-extrabold uppercase leading-tight [overflow-wrap:anywhere] sm:text-sm md:text-base">{item.title}</p>
        </div>
      </div>
    </button>
  );
}

export default function Work({ items = [], groups = [], folder = "" }) {
  const [tab, setTab] = useState("all");
  const [slug, setSlug] = useState(null);
  const [cols, setCols] = useState(0); // 0 = not measured yet (first paint uses plain CSS columns)

  useEffect(() => {
    const f = () => setCols(window.innerWidth >= 1280 ? 4 : window.innerWidth >= 768 ? 3 : 2);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    const read = () => {
      const s = new URLSearchParams(window.location.search).get("work");
      setSlug(items.some((x) => x.slug === s) ? s : null);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [items]);

  const urlFor = (s) => `${window.location.pathname}?work=${encodeURIComponent(s)}`;
  const open = (item) => {
    window.history.pushState({ bosWork: true }, "", urlFor(item.slug));
    setSlug(item.slug);
  };
  const jump = useCallback((s) => {
    window.history.replaceState(window.history.state, "", urlFor(s));
    setSlug(s);
  }, []);
  const close = useCallback(() => {
    if (window.history.state?.bosWork) window.history.back(); // popstate clears the popup
    else {
      window.history.replaceState(null, "", window.location.pathname);
      setSlug(null);
    }
  }, []);
  const noop = useCallback(() => {}, []);

  const shown = useMemo(() => (tab === "all" ? items : items.filter((x) => x.group === tab)), [items, tab]);
  const active = slug && items.find((x) => x.slug === slug);
  const tabs = [{ key: "all", label: "All work", count: items.length }, ...(groups.length > 1 ? groups : [])];
  const tabBtn = "flex items-center gap-3 border px-4 py-3 font-display text-[11px] font-bold uppercase tracking-[0.14em] transition";

  return (
    <section id="work" className="border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        <p className="label mb-4">[ Work archive ]</p>
        <h2 className="h-display mb-10 text-4xl md:text-6xl">
          Made to be <span className="text-brand">watched.</span>
        </h2>

        {items.length === 0 ? (
          <p className="max-w-xl border-l-2 border-brand pl-4 text-ink/70">
            No videos found yet. Put your work videos in <code className="font-mono text-sm text-ink">{folder}</code> and refresh this page.
          </p>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  aria-pressed={tab === t.key}
                  data-cursor-light={tab === t.key ? "" : undefined}
                  className={`${tabBtn} ${tab === t.key ? "border-ink bg-ink text-white" : "border-ink/15 text-ink hover:border-brand hover:text-brand"}`}
                >
                  {t.label}
                  <span className={`font-mono text-[10px] font-medium ${tab === t.key ? "text-brand" : "text-ink/40"}`}>({String(t.count).padStart(2, "0")})</span>
                </button>
              ))}
            </div>

            {cols === 0 ? (
              <div className="columns-2 gap-3 md:columns-3 xl:columns-4">
                {shown.map((item, i) => (
                  <Tile key={item.slug} item={item} n={i + 1} onOpen={open} />
                ))}
              </div>
            ) : (
              // dealt out left to right, so the films read 1, 2, 3 ... across the top
              <div className="flex gap-3">
                {Array.from({ length: cols }, (_, c) => (
                  <div key={c} className="min-w-0 flex-1">
                    {shown.map((item, i) => (i % cols === c ? <Tile key={item.slug} item={item} n={i + 1} onOpen={open} /> : null))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {active && <WatchModal series={active} index={0} onSelect={noop} onClose={close} catalogue={shown.includes(active) ? shown : items} onJump={jump} moreLabel="More work" />}
    </section>
  );
}
