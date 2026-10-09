import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import HeroScene from "@/components/v2/HeroScene";

const inter = Inter({ variable: "--nf-inter", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const outfit = Outfit({ variable: "--nf-outfit", subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "Tapki — Un toque abre soluciones",
  description: "Software completo para cada problema: Tapki Menu, Tapki Control, Tapki Card y Tapki Vendedor.",
};

export default function OptionTwo() {
  return (
    <main className={`${inter.variable} ${outfit.variable} ${mono.variable} bg-black`}>
      <HeroScene />
    </main>
  );
}
