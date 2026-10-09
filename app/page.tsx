import Catalog from "@/components/Catalog";
import Hero from "@/components/Hero";
import SectionNav from "@/components/SectionNav";

export default function Home() {
  return (
    <main className="flex flex-col">
      <SectionNav />
      <Hero />
      <Catalog />
    </main>
  );
}
