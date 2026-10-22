import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import HomeHero from "@/components/HomeHero";
import AdFilms from "@/components/AdFilms";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Offerings from "@/components/Offerings";
import Clients from "@/components/Clients";
import Pipeline from "@/components/Pipeline";
import Faq from "@/components/Faq";
import { SHARE_IMAGE, staticFilms } from "@/lib/site-data";

export const metadata = {
  title: { absolute: "Brands On Steroids — AI-Native Films, Ads & Micro-Dramas" },
  alternates: { canonical: "/" },
  openGraph: { url: "/", images: [SHARE_IMAGE] },
};

export default async function Home() {
  const films = await staticFilms(); // titles + frame shapes in the page itself; video links load in the browser
  return (
    <>
      <Rail />
      <Nav />
      <main className="md:pl-[84px]">
        <HomeHero />
        <Clients />
        <Offerings />
        <AdFilms initial={films} />
        <Pipeline />
        <About />
        <Faq />
        <Contact />
      </main>
    </>
  );
}
