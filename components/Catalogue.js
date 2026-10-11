"use client";
import { useState } from "react";
import { videos } from "@/data/videos";
import VideoModal from "./VideoModal";

export default function Catalogue() {
  const [active, setActive] = useState(null);
  return (
    <section id="catalogue" className="border-t border-ink/10 px-5 py-24 md:px-12">
      <div className="max-w-7xl">
        <p className="label mb-4">[ The catalogue ]</p>
        <h2 className="h-display mb-12 text-4xl md:text-6xl">Every episode. <span className="text-brand">One feed.</span></h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {videos.map((v) => (
            <button key={v.id} onClick={() => setActive(v)} className="group text-left">
              <div className="relative aspect-[9/16] overflow-hidden border border-ink/10 bg-gradient-to-b from-ink/10 to-ink/0 transition group-hover:border-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.poster}
                  alt={v.title}
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-white/80">
                  FRAME {String(v.id).padStart(2, "0")}
                </span>
                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-brand text-xs text-white">▶</span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-white">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand">{v.genre}</p>
                  <p className="font-display text-base font-extrabold uppercase leading-tight">{v.title}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
