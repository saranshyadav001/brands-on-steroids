"use client";
import { useEffect, useRef } from "react";

// Home hero background: a pink mesh that flows slowly on its own, bends away from the
// cursor and glows around it. Drawn on a canvas; stops while the hero is off screen.
const GAP = 68; // distance between mesh points, px
const REACH = 240; // how far the cursor is felt, px
const PUSH = 42; // how far a point moves away from the cursor, px
const PINK = "248, 40, 112";

export default function HeroMesh() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, cols = 0, rows = 0, pts = new Float32Array(0), raf = 0, seen = true;
    let left = 0, top = 0; // where the canvas is on the screen
    let mx = 0, my = 0, cx = 0, cy = 0, pull = 0, want = 0; // cursor: target, eased position, eased strength

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 3;
      rows = Math.ceil(h / GAP) + 3;
      pts = new Float32Array(cols * rows * 3); // x, y, glow
      if (still) draw(0);
    };

    function draw(t) {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      pull += (want - pull) * 0.08;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c - 1) * GAP;
          const by = (r - 1) * GAP;
          let x = bx + Math.sin(t * 0.00042 + by * 0.011 + c * 0.6) * 15 + Math.cos(t * 0.00027 + bx * 0.007) * 9;
          let y = by + Math.cos(t * 0.00036 + bx * 0.01 + r * 0.5) * 15 + Math.sin(t * 0.00031 + by * 0.008) * 9;
          let glow = 0;
          const dx = x - cx;
          const dy = y - cy;
          const d = Math.hypot(dx, dy);
          if (pull > 0.01 && d < REACH) {
            const f = (1 - d / REACH) ** 2 * pull;
            x += (dx / (d || 1)) * f * PUSH;
            y += (dy / (d || 1)) * f * PUSH;
            glow = f;
          }
          const i = (r * cols + c) * 3;
          pts[i] = x;
          pts[i + 1] = y;
          pts[i + 2] = glow;
        }
      }

      ctx.clearRect(0, 0, w, h);
      // the whole mesh, faint, in one stroke
      ctx.beginPath();
      const lit = [];
      const link = (a, b) => {
        ctx.moveTo(pts[a], pts[a + 1]);
        ctx.lineTo(pts[b], pts[b + 1]);
        const g = (pts[a + 2] + pts[b + 2]) / 2;
        if (g > 0.015) lit.push(a, b, g);
      };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 3;
          if (c + 1 < cols) link(i, i + 3);
          if (r + 1 < rows) link(i, i + cols * 3);
          if (c + 1 < cols && r + 1 < rows) link(i, i + cols * 3 + 3);
        }
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${PINK}, 0.13)`;
      ctx.stroke();

      // the part near the cursor, brighter
      for (let k = 0; k < lit.length; k += 3) {
        const a = lit[k], b = lit[k + 1], g = lit[k + 2];
        ctx.beginPath();
        ctx.moveTo(pts[a], pts[a + 1]);
        ctx.lineTo(pts[b], pts[b + 1]);
        ctx.lineWidth = 1 + g * 1.4;
        ctx.strokeStyle = `rgba(${PINK}, ${Math.min(0.8, g * 1.5)})`;
        ctx.stroke();
      }

      // the points
      for (let i = 0; i < pts.length; i += 3) {
        const g = pts[i + 2];
        ctx.beginPath();
        ctx.arc(pts[i], pts[i + 1], 1.3 + g * 3, 0, 6.2832);
        ctx.fillStyle = `rgba(${PINK}, ${0.3 + Math.min(0.65, g * 1.6)})`;
        ctx.fill();
      }
    }

    const loop = (t) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (seen && !still) raf = requestAnimationFrame(loop);
    };

    const place = () => {
      const r = canvas.getBoundingClientRect();
      left = r.left;
      top = r.top;
    };
    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      place();
      mx = e.clientX - left;
      my = e.clientY - top;
      if (want === 0 && pull < 0.01) {
        cx = mx; // arriving: start at the cursor instead of sweeping in from a corner
        cy = my;
      }
      want = 1;
      if (still) draw(0);
    };
    const onLeave = () => {
      want = 0;
    };

    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      run();
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    size();
    run();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
