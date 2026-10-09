"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/content";

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "es",
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "es" || saved === "en") return setLang(saved);
    } catch {}
    if (navigator.language.startsWith("en")) setLang("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

export function LangToggle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
      className={className}
      style={style}
    >
      <span className={lang === "es" ? "text-black" : "text-black/35"}>ES</span>
      <span className="text-black/25">/</span>
      <span className={lang === "en" ? "text-black" : "text-black/35"}>EN</span>
    </button>
  );
}
