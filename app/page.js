import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Catalogue from "@/components/Catalogue";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Rail />
      <Nav />
      <main className="md:pl-[84px]">
        <Hero />
        <Catalogue />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  );
}
