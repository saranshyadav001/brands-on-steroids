import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import HomeHero from "@/components/HomeHero";
import AdFilms from "@/components/AdFilms";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { getHomeFilms } from "@/lib/library";

// Rendered on every request so new files in the content folder show up
// straight away and the signed video links are always fresh.
export const dynamic = "force-dynamic";

export default function Home() {
  const films = getHomeFilms();
  return (
    <>
      <Rail />
      <Nav />
      <main className="md:pl-[84px]">
        <HomeHero />
        <AdFilms items={films.items} folder={films.folder} />
        <About />
        <Contact />
      </main>
    </>
  );
}
