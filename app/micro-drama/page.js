import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Catalogue from "@/components/Catalogue";
import IpDrop from "@/components/IpDrop";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { getLibrary } from "@/lib/library";

// Rendered on every request so new files in the content folder show up
// straight away and the signed video links are always fresh.
export const dynamic = "force-dynamic";

export const metadata = { title: "Micro Drama — Brands On Steroids" };

export default async function MicroDrama() {
  const library = await getLibrary();
  return (
    <>
      <Rail clear />
      <Nav />
      <main className="md:pl-[84px]">
        <Hero />
        <Catalogue series={library.series} folder={library.folder} missing={library.missing} />
        <IpDrop />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  );
}
