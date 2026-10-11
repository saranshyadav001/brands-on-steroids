import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Catalogue from "@/components/Catalogue";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { getLibrary } from "@/lib/library";

// Rendered on every request so new files in the content folder show up
// straight away and the signed video links are always fresh.
export const dynamic = "force-dynamic";

export default function Home() {
  const library = getLibrary();
  return (
    <>
      <Rail />
      <Nav />
      <main className="md:pl-[84px]">
        <Hero />
        <Catalogue series={library.series} folder={library.folder} missing={library.missing} />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  );
}
