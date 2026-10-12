"use client";
import { useEffect, useRef } from "react";

// The ribbon down the left edge (desktop).
// clear (micro-drama page): while the hero video is behind it the ribbon has no panel, so the
// video shows through and the words are white. Below the hero it is the normal paper ribbon.
// Both versions are always there, each cut off at the hero's bottom edge (--cut), so the
// change follows the video exactly as you scroll.
function Marks({ light = false }) {
  const meta = `meta ${light ? "!text-white/70" : ""}`;
  return (
    <>
      <div className="text-center">
        <span className="mx-auto mb-2 block h-2.5 w-2.5 rounded-full bg-brand" />
        <span className={meta}>01/01</span>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="font-display text-sm font-extrabold uppercase tracking-[0.15em] [writing-mode:vertical-rl] rotate-180">Brands on Steroids</p>
        <div className="text-center">
          <p className={meta}>35MM</p>
          <p className={meta}>A24+</p>
          <p className="mt-2 font-mono text-[10px] font-medium tracking-widest text-brand">24FPS</p>
        </div>
      </div>
    </>
  );
}

export default function Rail({ clear = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!clear) return;
    const hero = document.getElementById("top");
    const f = () => ref.current?.style.setProperty("--cut", `${Math.max(0, hero ? hero.getBoundingClientRect().bottom : 0)}px`);
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => {
      window.removeEventListener("scroll", f);
      window.removeEventListener("resize", f);
    };
  }, [clear]);

  const frame = "fixed left-0 top-0 z-30 hidden h-screen w-[84px] flex-col items-center justify-between py-8 md:flex";
  const paper = `${frame} border-r border-ink/10 bg-paper/80 backdrop-blur`;
  if (!clear) {
    return (
      <aside className={paper}>
        <Marks />
      </aside>
    );
  }
  return (
    <div ref={ref} style={{ "--cut": "100vh" }}>
      <aside className={`${frame} shade pointer-events-none border-r border-white/15 text-white [clip-path:inset(0_0_calc(100%-var(--cut))_0)]`}>
        <Marks light />
      </aside>
      <div aria-hidden="true" className={`${paper} pointer-events-none [clip-path:inset(var(--cut)_0_0_0)]`}>
        <Marks />
      </div>
    </div>
  );
}
