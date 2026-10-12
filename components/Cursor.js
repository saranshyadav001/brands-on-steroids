"use client";
import { useEffect, useRef } from "react";

// Custom cursor: a ring + pink dot. Over anything clickable it turns into a filled
// circle with a word in it. The word comes from the nearest data-cursor="..." attribute
// ("Create", "Watch" ...); links and buttons without one say "Open" / "Select".
// data-cursor="" switches the word off for an area (the video player).
export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);
  const tag = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return; // skip touch devices
    const root = document.documentElement;
    let x = -100, y = -100, rx = -100, ry = -100, shown = false, raf;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        root.classList.add("has-cursor");
      }
      const t = e.target;
      const field = t.closest?.("input:not([type=checkbox]):not([type=radio]),select,textarea");
      const clickable = t.closest?.("a,button,label,[role=button]");
      const named = t.closest?.("[data-cursor]");
      const word = field ? "" : named ? named.dataset.cursor : clickable ? (clickable.tagName === "A" ? "Open" : "Select") : "";
      const hover = field || clickable ? "1" : "0";
      // nearest marked area wins: data-cursor-light = dark/coloured background (white cursor),
      // data-cursor-dark = light panel inside one of those (dark ring + pink dot again)
      const zone = t.closest?.("[data-cursor-light],[data-cursor-dark]");
      const light = zone && zone.hasAttribute("data-cursor-light") ? "1" : "0";
      for (const el of [ring.current, dot.current, tag.current]) {
        el.dataset.hover = hover;
        el.dataset.light = light;
        el.dataset.tag = word ? "1" : "0";
      }
      if (word && tag.current.firstChild.textContent !== word) tag.current.firstChild.textContent = word;
    };
    const onLeave = () => {
      shown = false;
      root.classList.remove("has-cursor");
    };
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      tag.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true"><i /></div>
      <div ref={dot} className="cursor-dot" aria-hidden="true"><i /></div>
      <div ref={tag} className="cursor-tag" aria-hidden="true"><i /></div>
    </>
  );
}
