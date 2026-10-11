import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import HomeHero from "@/components/HomeHero";
import Work from "@/components/Work";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { getWork } from "@/lib/library";

// Rendered on every request so new files in the content folder show up
// straight away and the signed video links are always fresh.
export const dynamic = "force-dynamic";

export default function Home() {
  const work = getWork();
  return (
    <>
      <Rail />
      <Nav />
      <main className="md:pl-[84px]">
        <HomeHero />
        <Work items={work.items} groups={work.groups} folder={work.folder} />
        <About />
        <Contact />
      </main>
    </>
  );
}
