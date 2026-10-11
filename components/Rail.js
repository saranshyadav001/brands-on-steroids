export default function Rail() {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[84px] flex-col items-center justify-between border-r border-ink/10 bg-paper/80 py-8 backdrop-blur md:flex">
      <div className="text-center">
        <span className="mx-auto mb-2 block h-2.5 w-2.5 rounded-full bg-brand" />
        <span className="meta">01/01</span>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="font-display text-sm font-extrabold uppercase tracking-[0.15em] [writing-mode:vertical-rl] rotate-180">Brands on Steroids</p>
        <div className="text-center">
          <p className="meta">35MM</p>
          <p className="meta">A24+</p>
          <p className="mt-2 font-mono text-[10px] font-medium tracking-widest text-brand">24FPS</p>
        </div>
      </div>
    </aside>
  );
}
