"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/Lang";
import { copy, projects } from "@/lib/content";
import { EASE, wa } from "@/lib/hero-data";

export default function Catalog() {
  const { lang } = useLang();
  const t = copy[lang];
  const reduceMotion = useReducedMotion();
  const inView = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.8, ease: EASE },
      };

  return (
    <section id="productos" className="bg-[var(--background)] px-5 py-24 font-display lg:px-16 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div {...inView} className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/45">{t.catalogKicker}</p>
          <h2 className="mt-3 text-4xl font-normal uppercase leading-none tracking-[-0.03em] lg:text-6xl">{t.catalogTitle}</h2>
          <p className="mt-5 text-lg font-medium text-black/60">{t.catalogIntro}</p>
        </motion.div>

        <div className="mt-20 flex flex-col gap-28">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              id={p.id}
              {...inView}
              className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20"
            >
              <div className={`relative mx-auto w-full max-w-[300px] ${i % 2 ? "lg:order-2" : ""}`}>
                <div className="absolute -inset-10 -z-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),transparent)]" />
                <div className="relative aspect-[390/780] overflow-hidden rounded-[40px] border-[10px] border-black bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.shot} alt={p.name} loading="lazy" className="h-full w-full object-cover object-top" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      p.status === "live" ? "bg-black text-white" : "border border-black/30 text-black/60"
                    }`}
                  >
                    {p.status === "live" ? t.live : t.dev}
                  </span>
                  <span className="text-sm font-medium text-black/45">{p.niche[lang]}</span>
                </div>
                <h3 className="mt-5 text-4xl font-normal uppercase leading-none tracking-[-0.03em] lg:text-5xl">{p.name}</h3>
                <p className="mt-4 text-xl font-medium">{p.tagline[lang]}</p>

                <div className="mt-6 rounded-[20px] bg-black/[0.04] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/45">{t.problemLabel}</p>
                  <p className="mt-1 font-medium text-black/75">{p.problem[lang]}</p>
                </div>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {p.features[lang].map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] font-medium text-black/80">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-black" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={wa(t.wantDemo(p.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-black pl-6 pr-2 font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  {t.demo}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          {...inView}
          className="mt-32 flex flex-col items-start gap-6 rounded-[36px] bg-black p-8 text-white lg:flex-row lg:items-center lg:justify-between lg:p-14"
        >
          <div>
            <h2 className="text-3xl font-normal uppercase leading-none tracking-[-0.03em] lg:text-5xl">{t.otherTitle}</h2>
            <p className="mt-4 text-lg font-medium text-white/60">{t.otherText}</p>
          </div>
          <a
            href={wa(t.otherMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 shrink-0 items-center gap-3 rounded-full bg-white pl-6 pr-2 font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            {t.otherCta}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </a>
        </motion.div>
      </div>

      <footer className="mx-auto mt-20 flex max-w-6xl items-center gap-3 border-t border-black/10 pt-8 text-sm font-medium text-black/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="" className="h-8 w-8 rounded-full" />
        <span>
          Tapki © {new Date().getFullYear()} · {t.footer}
        </span>
      </footer>
    </section>
  );
}
