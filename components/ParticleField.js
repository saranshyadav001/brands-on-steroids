"use client";
import { useEffect, useRef } from "react";

// Drifting "constellation" behind the home hero: small dots that slowly float,
// faint lines between dots that are close together, and a few dots carrying a
// tiny label that fades in and out. The cursor is part of it: it links to the dots
// around it in pink, lights up their lines and nudges them out of its way.
// Drawn on one <canvas>; pauses off-screen.
const LABELS = ["NEURAL", "CULTURE", "PROMPT_08", "ENTERTAINMENT", "24FPS", "AI FILM", "A24", "NO ADS"];
const REACH = 210; // how far the cursor is felt, px
const PINK = "248,40,112";

export default function ParticleField({ count = 48, linkDistance = 150 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, running = false;
    let mx = 0, my = 0, near = 0, want = 0; // cursor position (inside the canvas) and how strongly it is felt
    const rnd = (a, b) => a + Math.random() * (b - a);

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    // `count` dots on a laptop screen, fewer on a phone so it never gets crowded
    const n = Math.max(20, Math.min(count, Math.round((w * h) / 27000)));
    let labelled = 0;
    const pts = Array.from({ length: n }, () => ({
      x: rnd(0, w),
      y: rnd(0, h),
      vx: rnd(-0.14, 0.14),
      vy: rnd(-0.1, 0.1),
      px: 0, // extra speed from being pushed by the cursor (fades out)
      py: 0,
      r: rnd(1.3, 2.8),
      pink: Math.random() < 0.12,
      label: labelled < LABELS.length && Math.random() < 0.3 ? LABELS[labelled++] : null,
      phase: rnd(0, Math.PI * 2),
      glow: 0, // 0..1, how close the cursor is
    }));

    const draw = (t = 0) => {
      near += (want - near) * 0.1;
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        const d = Math.hypot(p.x - mx, p.y - my);
        p.glow = near > 0.01 && d < REACH ? (1 - d / REACH) * near : 0;
      }

      // links between dots: grey, turning pink around the cursor
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < linkDistance) {
            const k = 1 - d / linkDistance;
            const g = Math.min(pts[i].glow, pts[j].glow);
            ctx.lineWidth = 0.6 + g * 1.2;
            ctx.strokeStyle = g > 0.02 ? `rgba(${PINK},${k * (0.12 + g * 0.75)})` : `rgba(8,8,8,${k * 0.1})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // links from the cursor to the dots around it
      for (const p of pts) {
        if (p.glow < 0.02) continue;
        ctx.lineWidth = 0.6 + p.glow;
        ctx.strokeStyle = `rgba(${PINK},${p.glow * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      // dots + labels
      ctx.font = '600 9px "JetBrains Mono", ui-monospace, monospace';
      ctx.textBaseline = "middle";
      for (const p of pts) {
        const g = p.glow;
        ctx.fillStyle = p.pink || g > 0.05 ? `rgba(${PINK},${0.45 + g * 0.5})` : "rgba(8,8,8,0.25)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + g * 2.2, 0, Math.PI * 2);
        ctx.fill();
        if (p.label) {
          const a = 0.06 + 0.16 * (0.5 + 0.5 * Math.sin(t / 1800 + p.phase)) + g * 0.5;
          ctx.fillStyle = `rgba(8,8,8,${a})`;
          ctx.fillText(p.label, p.x + 8 + g * 2, p.y);
        }
        if (!still) {
          if (g > 0) {
            // step out of the cursor's way
            const dx = p.x - mx, dy = p.y - my;
            const d = Math.hypot(dx, dy) || 1;
            p.px += (dx / d) * g * 0.22;
            p.py += (dy / d) * g * 0.22;
          }
          p.px *= 0.93;
          p.py *= 0.93;
          p.x += p.vx + p.px;
          p.y += p.vy + p.py;
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || still) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      want = 1;
      if (still) {
        near = 1;
        draw();
      }
    };
    const onLeave = () => {
      want = 0;
    };

    draw();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      size();
      if (!running) draw();
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [count, linkDistance]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
