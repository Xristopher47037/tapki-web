import type { Metadata } from "next";
import { Bai_Jamjuree, Geist } from "next/font/google";
import { LangProvider } from "@/components/Lang";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const baiJamjuree = Bai_Jamjuree({
  variable: "--font-bai-jamjuree",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tapki — Software completo para cada problema",
  description:
    "Creamos programas distintos para problemas distintos: Tapki Menu, Tapki Control, Tapki Card y Tapki Vendedor.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${baiJamjuree.variable} antialiased`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
