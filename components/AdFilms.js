"use client";
import { useEffect, useRef, useState } from "react";
import Player from "./Player";

// Home page "Ad films": every video from the homepage folder, one under the other,
// each with just its title (above wide videos, beside tall ones). The list comes from the server
// (lib/library.js getHomeFilms). A video is only loaded when you scroll near it,
// plays when clicked, and pauses when you scroll past it or start another one.

function Film({ item }) {
  const box = useRef(null);
  const [near, setNear] = useState(false); // close enough to the screen to load
  const [ratio, setRatio] = useState(16 / 9);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const load = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          load.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );
    const away = new IntersectionObserver(([e]) => !e.isIntersecting && el.querySelector("video")?.pause(), { threshold: 0 });
    load.observe(el);
    away.observe(el);
    return () => {
      load.disconnect();
      away.disconnect();
    };
  }, []);

  // Tall (vertical) and square videos: video on the left, title on the right.
  // Wide videos: title above. Either way the frame is exactly the shape of the
  // video, so there are never black bars beside it.
  const side = ratio <= 1.1;
  const title = (
    <h3 className={`h-display text-2xl [overflow-wrap:anywhere] ${side ? "mb-5 md:mb-0 md:min-w-0 md:flex-1 md:text-[clamp(1.1rem,2.6vw,3rem)]" : "mb-5 md:mb-7 md:text-4xl"}`}>
      {item.title}
      {item.group && <span className="text-brand"> // {item.group}</span>}
    </h3>
  );
  return (
    <article className={`border-t border-ink/10 py-10 first-of-type:border-t-0 first-of-type:pt-0 md:py-14 ${side ? "md:flex md:flex-row-reverse md:items-center md:gap-10 lg:gap-16" : ""}`}>
      {title}
      <div
        ref={box}
        data-cursor-light
        className={`flex items-center justify-center overflow-hidden border border-ink/10 bg-ink ${
          side
            ? "w-[min(100%,calc(78vh*var(--r)))] md:h-[min(82vh,780px,calc(44vw/var(--r)))] md:w-auto md:shrink-0"
            : "w-[min(100%,calc(82vh*var(--r)))]"
        }`}
        style={{ "--r": ratio, aspectRatio: String(ratio) }}
      >
        {near && (
          <Player
            src={item.src}
            title={item.title}
            autoPlay={false}
            hotkeys={false}
            nav={false}
            posterAt={2}
            fill
            onMeta={(w, h) => w && h && setRatio(Math.min(2.4, Math.max(0.45, w / h)))}
          />
        )}
      </div>
    </article>
  );
}

export default function AdFilms({ items = [], folder = "" }) {
  return (
    <section id="work" className="border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        <h2 className="h-display mb-12 text-4xl md:mb-16 md:text-6xl">
          Ad <span className="text-brand">films</span>
        </h2>

        {items.length === 0 ? (
          <p className="max-w-xl border-l-2 border-brand pl-4 text-ink/70">
            No videos found yet. Put your videos in <code className="font-mono text-sm text-ink">{folder}</code> and refresh this page.
          </p>
        ) : (
          items.map((item) => <Film key={item.key} item={item} />)
        )}
      </div>
    </section>
  );
}
