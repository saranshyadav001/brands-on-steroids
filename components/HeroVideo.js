"use client";
import { useEffect, useRef } from "react";

// Looping background video. Starts muted (required for autoplay);
// the "Sound" button in the navbar un-mutes it. Pauses when scrolled out of view.
export default function HeroVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.1 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      id="hero-video"
      ref={ref}
      src="/videos/hero.mp4"
      poster="/posters/hero.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      onContextMenu={(e) => e.preventDefault()}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
