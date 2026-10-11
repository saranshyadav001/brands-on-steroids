"use client";
import { useEffect } from "react";

// Deters casual downloading: no download button, no right-click, no PiP.
// Anyone can still screen-record or open the file URL directly (see notes).
export default function VideoModal({ video, onClose }) {
  useEffect(() => {
    if (!video) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  if (!video) return null;
  return (
    <div data-cursor-light className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative max-h-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 font-mono text-xs uppercase tracking-widest text-white/70 hover:text-brand">
          Esc / Close
        </button>
        <video
          key={video.src}
          src={video.src}
          poster={video.poster}
          controls
          autoPlay
          playsInline
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="max-h-[85vh] max-w-[92vw] bg-black"
        />
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/60">
          {video.genre} - <span className="text-white">{video.title}</span>
        </p>
      </div>
    </div>
  );
}
