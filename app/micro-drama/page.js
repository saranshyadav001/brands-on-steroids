import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Catalogue from "@/components/Catalogue";
import IpDrop from "@/components/IpDrop";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { SHARE_IMAGE, staticCatalogue } from "@/lib/site-data";

export const metadata = {
  title: "AI Micro-Drama Series & Original IPs",
  description:
    "Watch AI micro-drama series from Brands On Steroids and license 80 new original microdrama IPs. On-demand AI video production, bulk micro-drama, branded and sponsored series.",
  alternates: { canonical: "/micro-drama" },
  openGraph: { url: "/micro-drama", images: [SHARE_IMAGE] },
};

export default async function MicroDrama() {
  const catalogue = await staticCatalogue(); // titles + descriptions in the page itself; video links load in the browser
  return (
    <>
      <Rail clear />
      <Nav />
      <main className="md:pl-[84px]">
        <Hero />
        <Catalogue initial={catalogue} />
        <IpDrop />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  );
}
