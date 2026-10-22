"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import WatchModal from "./WatchModal";
import { useLibrary } from "./useLibrary";

// The list is fetched from /api/library (lib/library.js), built from the content folder / bucket.
// Opening a card puts ?watch=<series>&ep=<n> in the address bar, so the browser
// back button closes the popup and a shared link opens the same episode.

const POSTER_AT = 2; // second of the video used as the card picture (when the folder has no poster image)

// Hovering a card plays a silent preview; leaving puts the poster frame back.
const hoverPlay = (e) => e.currentTarget.querySelector("[data-card-video]")?.play().catch(() => {});
const hoverStop = (e) => {
  const v = e.currentTarget.querySelector("[data-card-video]");
  if (!v) return;
  v.pause();
  try {
    v.currentTime = POSTER_AT;
  } catch {}
};

const firstPlayable = (s, want = 0) => {
  const i = Math.min(Math.max(0, want), s.episodes.length - 1);
  if (!s.episodes[i].locked) return i;
  const j = s.episodes.findIndex((e) => !e.locked);
  return j < 0 ? 0 : j;
};

const NONE = [];

// `initial`: the catalogue as text, built into the page (so search engines see it and nothing
// jumps while loading). The live list with video links replaces it as soon as it arrives.
export default function Catalogue({ initial }) {
  const { loading, failed, catalogue } = useLibrary();
  const live = catalogue?.series || null;
  const series = live || initial?.series || NONE;
  const folder = catalogue?.folder || initial?.folder || "";
  const missing = Boolean((catalogue || initial)?.missing);
  const [watch, setWatch] = useState(null); // { slug, ep }

  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      const s = (live || NONE).find((x) => x.slug === p.get("watch"));
      setWatch(s ? { slug: s.slug, ep: firstPlayable(s, parseInt(p.get("ep") || "0", 10) || 0) } : null);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [live]);

  const urlFor = (slug, ep) => `${window.location.pathname}?watch=${encodeURIComponent(slug)}&ep=${ep}`;

  const open = (s) => {
    const ep = firstPlayable(s);
    window.history.pushState({ bosWatch: true }, "", urlFor(s.slug, ep));
    setWatch({ slug: s.slug, ep });
  };
  const select = useCallback((ep) => {
    setWatch((w) => {
      if (!w) return w;
      window.history.replaceState(window.history.state, "", urlFor(w.slug, ep));
      return { ...w, ep };
    });
  }, []);
  const close = useCallback(() => {
    if (window.history.state?.bosWatch) window.history.back(); // popstate clears the popup
    else {
      window.history.replaceState(null, "", window.location.pathname);
      setWatch(null);
    }
  }, []);

  const jump = useCallback(
    (slug) => {
      const s = series.find((x) => x.slug === slug);
      if (!s) return;
      const ep = firstPlayable(s);
      window.history.replaceState(window.history.state, "", urlFor(slug, ep));
      setWatch({ slug, ep });
    },
    [series]
  );

  const active = watch && series.find((s) => s.slug === watch.slug);
  const playable = useMemo(() => series.filter((s) => s.episodes.some((e) => e.src)), [series]);

  return (
    <section id="catalogue" className="border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        <p className="label mb-4">[ The catalogue ]</p>
        <h2 className="h-display catalogue-title mb-12">
          Microdrama <span className="text-brand">IPs.</span>
        </h2>

        {loading && !series.length ? (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/40">Loading the catalogue ...</p>
        ) : failed && !series.length ? (
          <p className="max-w-xl border-l-2 border-brand pl-4 text-ink/70">The catalogue could not be loaded. Please reload the page.</p>
        ) : series.length === 0 ? (
          <p className="max-w-xl border-l-2 border-brand pl-4 text-ink/70">
            {missing ? "The video folder was not found." : "No videos found yet."} Put your videos in{" "}
            <code className="font-mono text-sm text-ink">{folder}</code> (one folder per series) and refresh this page.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {series.map((s, i) => {
              const preview = s.episodes.find((e) => e.src);
              return (
                <a
                  key={s.slug}
                  href={`/micro-drama/${s.slug}`}
                  onClick={(e) => {
                    // a plain click plays it here; ctrl/cmd-click etc. open the series page
                    if (!live || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    open(s);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  onMouseEnter={hoverPlay}
                  onMouseLeave={hoverStop}
                  data-cursor="Watch"
                  className="group block text-left"
                >
                  <div className="relative aspect-[9/16] overflow-hidden border border-ink/10 bg-gradient-to-b from-ink/30 to-ink/80 transition group-hover:border-brand">
                    {s.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.poster}
                        alt={`${s.title} poster`}
                        loading="lazy"
                        draggable={false}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      preview && (
                        // first frame of the video used as the poster
                        <video
                          src={`${preview.src}#t=${POSTER_AT}`}
                          data-card-video
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          tabIndex={-1}
                          aria-hidden="true"
                          disablePictureInPicture
                          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      )
                    )}
                    <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-white/80">FRAME {String(i + 1).padStart(2, "0")}</span>
                    <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-brand text-xs text-white">▶</span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-white">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-brand">
                        {[s.genre, s.episodes.length > 1 ? `${s.episodes.length} episodes` : ""].filter(Boolean).join(" · ") || "Watch"}
                      </p>
                      <p className="line-clamp-3 break-words font-display text-[11px] font-extrabold uppercase leading-tight sm:text-sm md:text-base">{s.title}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {active && <WatchModal series={active} index={watch.ep} onSelect={select} onClose={close} catalogue={playable} onJump={jump} />}
    </section>
  );
}
