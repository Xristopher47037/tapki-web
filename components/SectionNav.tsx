"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Home, Plus, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/Lang";
import { copy, projects } from "@/lib/content";

// Sticky section menu shown once the hero is scrolled past; highlights the section on screen.
export default function SectionNav({
  dark = false,
  productPrefix = "",
  custom,
}: {
  dark?: boolean;
  productPrefix?: string; // id prefix of each product section ("" -> #menu, "p-" -> #p-menu)
  custom?: string; // label for an extra #a-la-medida item
}) {
  const { lang } = useLang();
  const reduceMotion = useReducedMotion();
  const items: { id: string; label: string; icon: LucideIcon }[] = [
    { id: "inicio", label: copy[lang].home, icon: Home },
    ...projects.map((p) => ({ id: productPrefix + p.id, label: p.name.replace(/^Tapki\s+/, ""), icon: p.icon })),
    ...(custom ? [{ id: "a-la-medida", label: custom, icon: Plus }] : []),
  ];
  const ids = items.map((i) => i.id).join(",");
  const [show, setShow] = useState(false);
  const [active, setActive] = useState("inicio");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // A section counts as active while it crosses the middle band of the screen.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);

  // Keep the active pill visible when the bar scrolls sideways on phones.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (list && el) list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[45] flex justify-center px-3">
      <AnimatePresence>
        {show && (
          <motion.nav
            aria-label={lang === "es" ? "Secciones" : "Sections"}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex max-w-full items-center gap-1 rounded-full border p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl ${
              dark ? "border-white/10 bg-black/70 text-white" : "border-black/10 bg-white/80 text-black"
            }`}
          >
            <a href="#inicio" aria-label="Tapki" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="" className="h-8 w-8 rounded-full" />
            </a>
            <div ref={listRef} className="relative flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
              {items.map((item) => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    data-id={item.id}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive ? (dark ? "text-black" : "text-white") : dark ? "text-white/60 hover:text-white" : "text-black/55 hover:text-black"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={`section-pill-${dark ? "d" : "l"}`}
                        className={`absolute inset-0 rounded-full ${dark ? "bg-white" : "bg-black"}`}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5" strokeWidth={2.25} />
                    <span className="relative">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
