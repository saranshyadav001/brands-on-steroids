"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";

// Custom video player. The browser's own controls are never shown, so there is
// no download / "save video" / picture-in-picture / cast menu anywhere.
// A transparent layer sits on top of the <video>, so right-click and drag never
// reach the video element itself.

const fmt = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const h = Math.floor(m / 60);
  return h ? `${h}:${String(m % 60).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};

const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);
const I = {
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  vol: "M3 10v4h4l5 4V6L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z",
  mute: "M3 10v4h4l5 4V6L7 10H3zm18.3-.9-1.4-1.4L17 10.6l-2.9-2.9-1.4 1.4 2.9 2.9-2.9 2.9 1.4 1.4 2.9-2.9 2.9 2.9 1.4-1.4-2.9-2.9z",
  full: "M5 5h6v2H7v4H5V5zm8 0h6v6h-2V7h-4V5zM5 13h2v4h4v2H5v-6zm12 0h2v6h-6v-2h4v-4z",
  exit: "M9 5h2v6H5V9h4V5zm4 0h2v4h4v2h-6V5zM5 13h6v6H9v-4H5v-2zm8 0h6v2h-4v4h-2v-6z",
  prev: "M6 5h2v14H6zM20 5v14L9 12z",
  next: "M16 5h2v14h-2zM4 5l11 7-11 7z",
};

// Popup use (default): starts playing straight away, keyboard shortcuts on, prev / next buttons.
// Inline use on a page: autoPlay={false} hotkeys={false} nav={false} posterAt={2} fill
//   (fill = the video covers its whole frame; the frame is given the video's own shape)
//   -> shows a still frame, plays on click, and pauses when another player starts.
export default function Player({ src, title, onEnded, onPrev, onNext, autoPlay = true, hotkeys = true, nav = true, posterAt = 0, onMeta, fill = false }) {
  const uid = useId();
  const started = useRef(autoPlay); // inline: false until the first play (the still frame is not the start)
  const wrap = useRef(null);
  const vid = useRef(null);
  const hide = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState(false);
  const [ui, setUi] = useState(true);
  const [isFull, setIsFull] = useState(false);

  const poke = useCallback(() => {
    setUi(true);
    clearTimeout(hide.current);
    hide.current = setTimeout(() => setUi(false), 2600);
  }, []);

  const toggle = useCallback(() => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) {
      if (!started.current) {
        started.current = true;
        try {
          v.currentTime = 0; // leave the still frame, start from the beginning
        } catch {}
      }
      v.play().catch(() => {});
    } else v.pause();
    poke();
  }, [poke]);

  const seekBy = useCallback(
    (d) => {
      const v = vid.current;
      if (!v || !isFinite(v.duration)) return;
      v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + d));
      poke();
    },
    [poke]
  );

  const toggleMute = useCallback(() => {
    const v = vid.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    poke();
  }, [poke]);

  const toggleFull = useCallback(() => {
    const el = wrap.current;
    const v = vid.current;
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    if (active) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (v && v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iPhone
  }, []);

  // new episode: reset and start playing
  useEffect(() => {
    const v = vid.current;
    setCur(0);
    setDur(0);
    setError(false);
    setWaiting(true);
    started.current = autoPlay;
    if (!v || !src) return;
    if (autoPlay) v.play().catch(() => setPlaying(false)); // autoplay can be blocked when opened from a shared link
    poke();
    return () => clearTimeout(hide.current);
  }, [src, poke, autoPlay]);

  // only one player makes sound at a time
  useEffect(() => {
    const onOther = (e) => {
      if (e.detail !== uid) vid.current?.pause();
    };
    window.addEventListener("bos-play", onOther);
    return () => window.removeEventListener("bos-play", onOther);
  }, [uid]);

  useEffect(() => {
    const onFs = () => setIsFull(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);

  // keyboard: space/k play, arrows seek, m mute, f fullscreen
  useEffect(() => {
    if (!hotkeys) return;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "k" || (e.key === " " && tag !== "BUTTON" && tag !== "A")) {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") seekBy(5);
      else if (e.key === "ArrowLeft") seekBy(-5);
      else if (e.key === "m") toggleMute();
      else if (e.key === "f") toggleFull();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkeys, toggle, seekBy, toggleMute, toggleFull]);

  const show = ui || !playing;
  const btn = "grid h-10 w-10 place-items-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white disabled:opacity-30";

  return (
    <div
      ref={wrap}
      onMouseMove={poke}
      onTouchStart={poke}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      data-cursor=""
      className={`relative h-full select-none items-center justify-center bg-black ${fill ? "flex w-full" : "inline-flex max-w-full"}`}
      style={{ WebkitTouchCallout: "none" }}
    >
      <video
        key={src}
        ref={vid}
        src={!autoPlay && posterAt ? `${src}#t=${posterAt}` : src}
        autoPlay={autoPlay}
        playsInline
        preload={autoPlay ? "auto" : "metadata"}
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        aria-label={title}
        onPlay={() => {
          started.current = true;
          setPlaying(true);
          window.dispatchEvent(new CustomEvent("bos-play", { detail: uid }));
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => started.current && setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDur(e.currentTarget.duration);
          onMeta?.(e.currentTarget.videoWidth, e.currentTarget.videoHeight);
          if (!autoPlay) setWaiting(false);
        }}
        onLoadedData={() => !autoPlay && setWaiting(false)}
        onDurationChange={(e) => setDur(e.currentTarget.duration)}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onError={() => setError(true)}
        onEnded={onEnded}
        className={`pointer-events-none h-full ${fill ? "w-full object-cover" : "w-auto max-w-full object-contain"}`}
      />

      {/* click / tap layer - sits above the video so the video itself is never the click target */}
      <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={toggle} onDoubleClick={toggleFull} className="absolute inset-0 h-full w-full" />

      {waiting && !error && src && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        </div>
      )}

      {!playing && !waiting && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-black/55 text-white backdrop-blur">
            <Icon d={I.play} size={38} />
          </span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center">
          <div>
            <p className="text-base font-medium">This video could not be played.</p>
            <p className="mt-2 text-sm text-white/60">The link may have expired, or this browser cannot play the file format. Reload the page and try again.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
              Reload
            </button>
          </div>
        </div>
      )}

      {/* controls */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-10 transition-opacity duration-300 ${
          show ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={dur || 0}
          step="0.1"
          value={Math.min(cur, dur || 0)}
          onChange={(e) => {
            const v = vid.current;
            started.current = true;
            if (v) v.currentTime = Number(e.target.value);
            setCur(Number(e.target.value));
            poke();
          }}
          className="player-seek block w-full"
          style={{ "--p": `${dur ? (cur / dur) * 100 : 0}%` }}
        />
        <div className="mt-1 flex items-center gap-1">
          {nav && (
            <button type="button" className={btn} onClick={onPrev} disabled={!onPrev} aria-label="Previous episode">
              <Icon d={I.prev} size={18} />
            </button>
          )}
          <button type="button" className={btn} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            <Icon d={playing ? I.pause : I.play} />
          </button>
          {nav && (
            <button type="button" className={btn} onClick={onNext} disabled={!onNext} aria-label="Next episode">
              <Icon d={I.next} size={18} />
            </button>
          )}
          <span className="ml-1 whitespace-nowrap font-mono text-[11px] tabular-nums text-white/80">
            {fmt(cur)} / {fmt(dur)}
          </span>
          <span className="flex-1" />
          <button type="button" className={btn} onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            <Icon d={muted ? I.mute : I.vol} />
          </button>
          <button type="button" className={btn} onClick={toggleFull} aria-label={isFull ? "Exit full screen" : "Full screen"}>
            <Icon d={isFull ? I.exit : I.full} />
          </button>
        </div>
      </div>
    </div>
  );
}
