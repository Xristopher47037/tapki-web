import Catalog from "@/components/Catalog";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Catalog />
    </main>
  );
}
