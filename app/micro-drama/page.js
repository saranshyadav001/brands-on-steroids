import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Catalogue from "@/components/Catalogue";
import IpDrop from "@/components/IpDrop";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";

export const metadata = { title: "Micro Drama — Brands On Steroids" };

export default function MicroDrama() {
  return (
    <>
      <Rail clear />
      <Nav />
      <main className="md:pl-[84px]">
        <Hero />
        <Catalogue />
        <IpDrop />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  );
}
