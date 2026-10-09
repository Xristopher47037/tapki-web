"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Chip from "@/components/Chip";
import { useLang } from "@/components/Lang";
import { projects } from "@/lib/content";
import { copy2 } from "./copy";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Products({ onQuote }: { onQuote: (product: string) => void }) {
  const { lang } = useLang();
  const t = copy2[lang];
  const s = t.section;
  const reduceMotion = useReducedMotion();
  const inView = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 40, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.9, ease: EASE },
      };
  const kicker = "font-mono text-[11px] uppercase tracking-[0.3em] text-white/40";
  const big = "font-outfit font-black uppercase leading-[0.9] tracking-[-0.03em]";

  return (
    <div className="relative bg-black font-inter text-white selection:bg-white selection:text-black">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />

      {/* Lo que hacemos: dos caminos */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32">
        <motion.div {...inView}>
          <p className={kicker}>{s.whatKicker}</p>
          <h2 className={`${big} mt-4 text-[clamp(2.5rem,7vw,6rem)]`}>
            {s.whatTitle[0]}
            <br />
            <span className="text-white/35">{s.whatTitle[1]}</span>
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {s.paths.map((path, i) => (
            <motion.div
              key={path.tag}
              {...inView}
              className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[28px] border p-8 md:p-10 ${
                i === 0 ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div>
                <p className={`font-mono text-[11px] uppercase tracking-[0.25em] ${i === 0 ? "text-black/45" : "text-white/40"}`}>
                  {path.tag}
                </p>
                <h3 className={`${big} mt-5 text-4xl md:text-5xl`}>{path.title}</h3>
                <p className={`mt-4 max-w-md text-base leading-relaxed ${i === 0 ? "text-black/65" : "text-white/60"}`}>
                  {path.text}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex -space-x-2">
                  {i === 0 ? (
                    <Chip className="h-11 w-11 ring-2 ring-white" />
                  ) : (
                    projects.map((p) => <Chip key={p.id} icon={p.icon} className="h-11 w-11 ring-2 ring-black" />)
                  )}
                </div>
                {i === 0 ? (
                  <button
                    type="button"
                    onClick={() => onQuote(t.quote.other)}
                    className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.04]"
                  >
                    {path.cta} <ArrowUpRight className="h-4 w-4" />
                  </button>
                ) : (
                  <a
                    href="#productos"
                    className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
                  >
                    {path.cta} <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section id="productos" className="relative mx-auto max-w-7xl scroll-mt-6 px-6 pb-24 md:px-12 md:pb-32">
        <motion.div {...inView} className="flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-16">
          <div>
            <p className={kicker}>{s.productsKicker}</p>
            <h2 className={`${big} mt-4 text-[clamp(2.5rem,7vw,6rem)]`}>
              {s.productsTitle[0]} <span className="text-white/35">{s.productsTitle[1]}</span>
            </h2>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
            {String(projects.length).padStart(2, "0")} / {projects.length}
          </span>
        </motion.div>

        <div className="mt-14 flex flex-col gap-6">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              id={`p-${p.id}`}
              {...inView}
              className="grid scroll-mt-8 items-center gap-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14"
            >
              <div className={i % 2 ? "lg:order-2" : ""}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[11px] tracking-[0.25em] text-white/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                      p.status === "live" ? "bg-white text-black" : "border border-white/25 text-white/60"
                    }`}
                  >
                    {p.status === "live" ? s.live : s.dev}
                  </span>
                  <span className="text-sm text-white/45">{p.niche[lang]}</span>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <Chip icon={p.icon} className="h-14 w-14" />
                  <h3 className={`${big} text-[clamp(2.2rem,5vw,4.2rem)]`}>{p.name}</h3>
                </div>
                <p className="mt-5 text-xl font-medium">{p.tagline[lang]}</p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">{s.problem}</p>
                  <p className="mt-1.5 text-white/75">{p.problem[lang]}</p>
                </div>
                <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {p.features[lang].map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] text-white/75">
                      <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rotate-45 bg-white" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onQuote(p.name)}
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                >
                  {s.demo}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </button>
              </div>

              <div className={`relative mx-auto w-full max-w-[280px] ${i % 2 ? "lg:order-1" : ""}`}>
                <div className="absolute -inset-12 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)]" />
                <div className="relative aspect-[390/780] overflow-hidden rounded-[40px] border-[9px] border-[#2a2a2d] bg-black shadow-[0_40px_90px_-30px_rgba(255,255,255,0.25)] ring-1 ring-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.shot} alt={p.name} loading="lazy" className="h-full w-full object-cover object-top grayscale" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* A la medida */}
      <section id="a-la-medida" className="relative mx-auto max-w-7xl scroll-mt-6 px-6 pb-24 md:px-12 md:pb-32">
        <motion.div {...inView} className="overflow-hidden rounded-[36px] bg-white p-8 text-black md:p-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-black/45">{s.customKicker}</p>
          <h2 className={`${big} mt-4 text-[clamp(2.4rem,6.5vw,5.5rem)]`}>
            {s.customTitle[0]}
            <br />
            <span className="text-black/35">{s.customTitle[1]}</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-black/65">{s.customText}</p>

          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {s.steps.map((step, i) => (
              <li key={step.title} className="rounded-3xl bg-black/[0.05] p-6">
                <span className="font-mono text-xs tracking-[0.25em] text-black/40">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-3 font-outfit text-2xl font-bold uppercase">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-black/60">{step.text}</p>
              </li>
            ))}
          </ol>

          <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.25em] text-black/45">{s.examplesLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.examples.map((e) => (
              <span key={e} className="rounded-full border border-black/15 px-4 py-2 text-sm">
                {e}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onQuote(t.quote.other)}
            className="mt-12 inline-flex items-center gap-3 rounded-full bg-black py-2.5 pl-7 pr-2.5 font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            {s.ideaCta}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </button>
        </motion.div>
      </section>

      <footer className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-10 text-sm text-white/45 md:px-12">
        <span className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" className="h-8 w-8 rounded-full ring-1 ring-white/20" />
          Tapki © {new Date().getFullYear()} · {s.footer}
        </span>
        <a href="/" className="font-mono text-[10px] uppercase tracking-[0.2em] hover:text-white">
          {s.option1} →
        </a>
      </footer>
    </div>
  );
}
