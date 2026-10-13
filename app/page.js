import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import HomeHero from "@/components/HomeHero";
import AdFilms from "@/components/AdFilms";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Rail />
      <Nav />
      <main className="md:pl-[84px]">
        <HomeHero />
        <AdFilms />
        <About />
        <Contact />
      </main>
    </>
  );
}
