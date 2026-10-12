import { site } from "@/data/site";
import HeroVideo from "./HeroVideo";

export default function Hero() {
  return (
    <section
      id="top"
      data-cursor-light
      className="relative flex min-h-screen items-center overflow-hidden px-5 pb-16 pt-32 text-white md:-ml-[84px] md:pl-[calc(84px+3rem)] md:pr-12"
    >
      {/* video is fully visible: no overlay on top of it. On desktop it also runs under the see-through side ribbon */}
      <HeroVideo />

      <div className="shade relative z-10 w-full max-w-6xl">
        <p className="label mb-6 !text-white/80">[ {site.tagline} ]</p>
        <h1 className="h-display text-[clamp(1.6rem,6.4vw,2.6rem)] md:text-[clamp(1.3rem,5vw,4.8rem)]">
          {site.heroLine1.split(" ")[0]}{" "}
          <span className="whitespace-nowrap">{site.heroLine1.split(" ").slice(1).join(" ")}</span>
          <br />
          {site.heroLine2}
          <br />
          <span className="text-brand">{site.heroAccent}</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg font-medium text-white/90">{site.heroText}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="#catalogue" className="btn btn-solid">Watch our work</a>
          <a href="#contact" className="btn border border-white/60 text-white hover:border-brand hover:text-brand">Book a call</a>
        </div>
      </div>
    </section>
  );
}
