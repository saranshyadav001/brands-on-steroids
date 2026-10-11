"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);

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
      const hover = t.closest?.("a,button,input,select,textarea,label,[role=button]") ? "1" : "0";
      const light = t.closest?.("[data-cursor-light]") ? "1" : "0";
      for (const el of [ring.current, dot.current]) {
        el.dataset.hover = hover;
        el.dataset.light = light;
      }
    };
    const onLeave = () => {
      shown = false;
      root.classList.remove("has-cursor");
    };
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
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
    </>
  );
}
