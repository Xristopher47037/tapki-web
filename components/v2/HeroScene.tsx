"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, Send, SlidersHorizontal, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Chip from "@/components/Chip";
import { useLang } from "@/components/Lang";
import { projects } from "@/lib/content";
import { wa } from "@/lib/hero-data";
import { copy2 } from "./copy";
import { ping, startPad, stopPad } from "./sound";
import TapScene from "./TapScene";

const EASE = [0.16, 1, 0.3, 1] as const;
const GLOW_COLORS = [
  { name: "Blanco", value: "rgba(255, 255, 255, 0.30)" },
  { name: "Hielo", value: "rgba(170, 205, 230, 0.40)" },
  { name: "Grafito", value: "rgba(140, 140, 150, 0.45)" },
  { name: "Cálido", value: "rgba(255, 214, 170, 0.35)" },
];

const openWa = (text: string) => window.open(wa(text), "_blank", "noopener,noreferrer");

export default function HeroScene() {
  const { lang } = useLang();
  const t = copy2[lang];
  const reduceMotion = useReducedMotion();

  const [ambientGlowColor, setAmbientGlowColor] = useState(GLOW_COLORS[0].value);
  const [glowSize, setGlowSize] = useState(80);
  const [glowIntensity, setGlowIntensity] = useState(1);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGlowControls, setShowGlowControls] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [touchDevice, setTouchDevice] = useState(false);
  const [moved, setMoved] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => setTouchDevice(window.matchMedia("(pointer: coarse)").matches), []);
  useEffect(() => () => stopPad(), []);

  // Same comfort-zone mapping as the prompt's video scrub: [0.1, 0.9] of the width -> [0, 1] of the animation.
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    progress.current = Math.max(0, Math.min(1, (percentage - 0.1) / 0.8));
    if (!moved) setMoved(true);
  };

  const toggleSound = () => {
    if (soundOn) stopPad();
    else startPad();
    setSoundOn(!soundOn);
  };

  const glowBg = `radial-gradient(circle, ${ambientGlowColor} 0%, rgba(0,0,0,0) 70%)`;
  const glow = (size: number) => ({ width: `${size * glowIntensity}%`, height: `${size * glowIntensity}%` });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex h-dvh flex-col justify-between overflow-hidden bg-black font-inter text-white selection:bg-white selection:text-black"
    >
      {/* z-0 ambient */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-60 mix-blend-overlay" />
        {/* Outer div owns position + studio scale; inner motion.div owns the breathing loop (Framer would overwrite a shared transform). */}
        <div
          className="absolute left-0 top-[20%]"
          style={{ ...glow(55), transform: `translate(-25%, 15%) scale(${glowSize / 100})` }}
        >
          <motion.div
            className="h-full w-full rounded-full blur-[100px]"
            style={{ background: glowBg }}
            animate={reduceMotion ? undefined : { scale: [1, 1.05, 1], opacity: [0.7, 0.85, 0.7] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div
          className="absolute right-0 top-[25%]"
          style={{ ...glow(50), transform: `translate(25%, -10%) scale(${glowSize / 100})` }}
        >
          <motion.div
            className="h-full w-full rounded-full blur-[110px]"
            style={{ background: glowBg }}
            animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.75, 0.9, 0.75] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90" />
      </div>

      {/* z-5 giant title, under the 3D scene */}
      <div className="pointer-events-none absolute inset-x-0 top-[16%] z-[5] select-none md:top-[13%] lg:top-[11%]">
        <TapkiTitle est={t.est} count={t.count(projects.length)} />
      </div>

      {/* z-10 the live 3D scene, screen-blended so its black drops out over the title */}
      <TapScene
        progress={progress}
        auto={touchDevice}
        reduceMotion={reduceMotion}
        screenText={t.screen}
        onTap={() => ping()}
        className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
      />

      {/* z-20 content */}
      <div className="relative z-20 flex h-full flex-col justify-between">
        <Header
          onMenu={() => setIsMenuOpen(true)}
          onChat={() => setIsChatOpen(true)}
          onStart={() => setIsProjectOpen(true)}
        />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-8 px-6 pb-20 md:px-12 lg:grid-cols-12">
          <div className="lg:col-span-6 xl:col-span-7">
            <LeftInfoBlock onStart={() => setIsProjectOpen(true)} onChat={() => setIsChatOpen(true)} />
          </div>
          <div className="hidden justify-end lg:col-span-6 lg:flex xl:col-span-5">
            <RightInfoBlock />
          </div>
        </div>
        <AnimatePresence>
          {!moved && !touchDevice && (
            <motion.p
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 md:block"
            >
              {t.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* z-40 floating widgets */}
      <div className="absolute bottom-5 left-6 z-40 md:left-12">
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-md transition-colors hover:text-white"
        >
          {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {t.sound} {soundOn ? "on" : "off"}
          <span className="flex h-3 items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[2px] rounded-full bg-white/70"
                animate={soundOn && !reduceMotion ? { height: ["30%", "100%", "45%", "80%", "30%"] } : { height: "30%" }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </span>
        </button>
      </div>

      <div className="absolute bottom-5 right-6 z-40 hidden flex-col items-end gap-3 md:flex md:right-12">
        <AnimatePresence>
          {showGlowControls && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
              className="w-64 rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{t.studio}</p>
              <p className="mt-4 text-xs text-white/60">{t.color}</p>
              <div className="mt-2 flex gap-2">
                {GLOW_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => setAmbientGlowColor(c.value)}
                    className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
                      ambientGlowColor === c.value ? "border-white" : "border-white/20"
                    }`}
                    style={{ background: c.value.replace(/[\d.]+\)$/, "1)") }}
                  />
                ))}
              </div>
              <label className="mt-4 block text-xs text-white/60">
                {t.size} · {glowSize}%
                <input
                  type="range"
                  min={40}
                  max={150}
                  value={glowSize}
                  onChange={(e) => setGlowSize(Number(e.target.value))}
                  className="mt-2 w-full accent-white"
                />
              </label>
              <label className="mt-3 block text-xs text-white/60">
                {t.intensity} · {glowIntensity.toFixed(1)}×
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="mt-2 w-full accent-white"
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          aria-label={t.studio}
          aria-expanded={showGlowControls}
          onClick={() => setShowGlowControls((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-md transition-colors hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* z-50 overlays */}
      <AnimatePresence>{isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{isProjectOpen && <ProjectModal onClose={() => setIsProjectOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{isChatOpen && <ChatDrawer onClose={() => setIsChatOpen(false)} />}</AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ title */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 18, stiffness: 100 } },
};

function TapkiTitle({ est, count }: { est: string; count: string }) {
  const word = "font-outfit font-black uppercase leading-[0.8] tracking-[-0.05em] text-[24vw] md:text-[17vw] lg:text-[15vw]";
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full max-w-7xl select-none px-6 pb-2 pt-4 md:px-12 md:pt-6"
    >
      <div className="relative flex flex-col items-stretch justify-between md:flex-row">
        <div className="absolute inset-y-0 left-1/2 hidden w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent md:block" />
        <motion.div variants={itemVariants}>
          <p className="mb-1 ml-2 font-mono text-xs uppercase tracking-[0.25em] text-white/40">{est}</p>
          <h1 className={word}>Tap</h1>
        </motion.div>
        <motion.div variants={itemVariants} className="md:text-right">
          <p className="mb-1 mr-2 font-mono text-xs uppercase tracking-[0.2em] text-white/40">{count}</p>
          <p aria-hidden className={word}>
            ki
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- header */

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] backdrop-blur-md"
      aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
    >
      <span className={lang === "es" ? "text-white" : "text-white/35"}>ES</span>
      <span className="text-white/25"> / </span>
      <span className={lang === "en" ? "text-white" : "text-white/35"}>EN</span>
    </button>
  );
}

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now ?? "--:--:--"}</span>;
}

function Header({ onMenu, onChat, onStart }: { onMenu: () => void; onChat: () => void; onStart: () => void }) {
  const { lang } = useLang();
  const t = copy2[lang];
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-12"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenu}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition-transform hover:scale-[1.04]"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[1.5px] w-3.5 bg-black" />
            <span className="block h-[1.5px] w-2.5 bg-black" />
          </span>
          {t.menu}
        </button>
        <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 backdrop-blur-md md:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />/ {t.city} — <Clock />
        </span>
      </div>

      <a href="/" aria-label="Tapki" className="absolute left-1/2 -translate-x-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="Tapki" className="h-10 w-10 rounded-full ring-1 ring-white/20" />
      </a>

      <div className="flex items-center gap-2">
        <span className="hidden md:block">
          <LangSwitch />
        </span>
        <button
          type="button"
          onClick={onChat}
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-colors hover:bg-white/10 sm:flex"
        >
          {t.chat}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition-transform hover:scale-[1.04]"
        >
          {t.start}
        </button>
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------ info blocks */

function LeftInfoBlock({ onStart, onChat }: { onStart: () => void; onChat: () => void }) {
  const { lang } = useLang();
  const t = copy2[lang];
  const digits = [...String(projects.length).padStart(2, "0"), "+"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      className="flex flex-col items-start gap-5"
    >
      <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-xs backdrop-blur-md">
        <span className="flex -space-x-2">
          {projects.slice(0, 3).map((p) => (
            <Chip key={p.id} icon={p.icon} className="h-6 w-6 ring-2 ring-black" />
          ))}
        </span>
        <span className="font-semibold">{t.pill(projects.length)}</span>
        <span className="text-white/40">✦</span>
      </span>

      <h2 className="font-outfit text-[clamp(2.2rem,5.2vw,4.6rem)] font-black uppercase leading-[0.95] tracking-[-0.02em]">
        <span className="block">{t.lines[0]}</span>
        <span className="flex items-center gap-3">
          {t.lines[1]} <span className="text-white/40">&gt;</span>
          <span className="flex gap-1">
            {digits.map((d, i) => (
              <motion.span
                key={i}
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ delay: 1 + i * 0.12, duration: 0.6, ease: EASE }}
                className="flex h-[1.05em] w-[0.8em] items-center justify-center rounded-md border border-white/20 bg-black font-mono text-[0.45em] font-bold"
              >
                {d}
              </motion.span>
            ))}
          </span>
          <span className="hidden self-end pb-2 font-mono text-[10px] font-normal tracking-[0.2em] text-white/40 xl:block">
            {t.unit}
          </span>
        </span>
        <span className="block">{t.lines[2]}</span>
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.04]"
        >
          {t.start}
        </button>
        <button
          type="button"
          onClick={onChat}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-colors hover:bg-white/10"
        >
          {t.chat}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function RightInfoBlock() {
  const { lang } = useLang();
  const t = copy2[lang];
  const [msg, setMsg] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
      className="flex w-full max-w-sm flex-col gap-5"
    >
      <p className="text-sm leading-relaxed text-white/70">
        {t.about}{" "}
        <a href="/#productos" className="inline-flex items-center gap-1 text-white underline-offset-4 hover:underline">
          {t.seeProducts} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          openWa(msg.trim() || copy2[lang].bot.hello);
        }}
        className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">{t.contactTitle}</p>
          <span className="text-white/40">✦</span>
        </div>
        <p className="mt-1 text-xs text-white/50">{t.contactSub}</p>
        <div className="mt-3 flex gap-1.5">
          {projects.map((p) => (
            <Chip key={p.id} icon={p.icon} className="h-7 w-7" />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 py-1 pl-4 pr-1">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={t.contactPlaceholder}
            aria-label={t.contactPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
          />
          <button
            type="submit"
            aria-label={t.send}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

/* --------------------------------------------------------------- overlays */

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm"
    />
  );
}

function SideMenu({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const t = copy2[lang];
  useEscape(onClose);
  return (
    <>
      <Backdrop onClose={onClose} />
      <motion.nav
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="absolute inset-y-0 left-0 z-50 flex w-[min(420px,90vw)] flex-col border-r border-white/10 bg-[#0b0b0b]/95 p-6 backdrop-blur-xl md:p-10"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">{t.menu}</span>
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded-full p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="mt-10 flex flex-col gap-1">
          {projects.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: EASE }}
            >
              <a href={`/#${p.id}`} className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-white/5">
                <Chip icon={p.icon} className="h-11 w-11" />
                <span className="flex-1">
                  <span className="block font-outfit text-2xl font-bold uppercase leading-none">{p.name}</span>
                  <span className="mt-1 block text-xs text-white/45">{p.niche[lang]}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </motion.li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-6">
          <LangSwitch />
          <a href="/" className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white">
            {lang === "es" ? "Ver opción 1" : "See option 1"} →
          </a>
        </div>
      </motion.nav>
    </>
  );
}

function ProjectModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const q = copy2[lang].quote;
  const products = [...projects.map((p) => p.name), q.other];
  const [product, setProduct] = useState(products[0]);
  const [business, setBusiness] = useState("");
  const [size, setSize] = useState(q.sizes[0]);
  const [when, setWhen] = useState(q.whens[0]);
  const [notes, setNotes] = useState("");
  useEscape(onClose);

  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition-colors ${
      active ? "border-white bg-white text-black" : "border-white/15 text-white/70 hover:border-white/40"
    }`;

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-4">
        <motion.form
          role="dialog"
          aria-modal="true"
          aria-label={q.title}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.45, ease: EASE }}
          onSubmit={(e) => {
            e.preventDefault();
            openWa(q.msg(product, business.trim(), size, when, notes.trim()));
          }}
          className="pointer-events-auto max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-outfit text-3xl font-black uppercase">{q.title}</h2>
              <p className="mt-1 text-sm text-white/50">{q.sub}</p>
            </div>
            <button type="button" onClick={onClose} aria-label={copy2[lang].close} className="rounded-full p-2 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <fieldset className="mt-6">
            <legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{q.product}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {products.map((p) => (
                <button key={p} type="button" aria-pressed={product === p} onClick={() => setProduct(p)} className={pill(product === p)}>
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            {q.business}
            <input
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-inter text-sm normal-case tracking-normal text-white outline-none focus:border-white/40"
            />
          </label>

          <fieldset className="mt-5">
            <legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{q.size}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.sizes.map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} className={pill(size === s)}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{q.when}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.whens.map((w) => (
                <button key={w} type="button" aria-pressed={when === w} onClick={() => setWhen(w)} className={pill(when === w)}>
                  {w}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            {q.notes}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-inter text-sm normal-case tracking-normal text-white outline-none focus:border-white/40"
            />
          </label>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
          >
            {q.submit} <ArrowUpRight className="h-4 w-4" />
          </button>
        </motion.form>
      </div>
    </>
  );
}

type Msg = { from: "bot" | "me"; text: string; wa?: string };

function ChatDrawer({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const b = copy2[lang].bot;
  const [messages, setMessages] = useState<Msg[]>([{ from: "bot", text: b.hello }]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  useEscape(onClose);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const reply = (question: string, answer: Msg) => {
    setMessages((m) => [...m, { from: "me", text: question }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, answer]);
    }, 700);
  };

  const asked = new Set(messages.filter((m) => m.from === "me").map((m) => m.text));

  return (
    <>
      <Backdrop onClose={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={b.title}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="absolute inset-y-0 right-0 z-50 flex w-[min(400px,100vw)] flex-col border-l border-white/10 bg-[#0b0b0b]"
      >
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <p className="font-semibold">{b.title}</p>
            <p className="flex items-center gap-1.5 text-xs text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {b.status}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={copy2[lang].close} className="rounded-full p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.from === "me" ? "self-end bg-white text-black" : "self-start bg-white/[0.08] text-white/90"
              }`}
            >
              {m.text}
              {m.wa && (
                <button
                  type="button"
                  onClick={() => openWa(m.wa!)}
                  className="mt-2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black"
                >
                  {b.openWa} <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          ))}
          {typing && (
            <div className="flex gap-1 self-start rounded-2xl bg-white/[0.08] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-white/60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {b.faqs
              .filter((f) => !asked.has(f.q))
              .map((f) => (
                <button
                  key={f.q}
                  type="button"
                  onClick={() => reply(f.q, { from: "bot", text: f.a })}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75 transition-colors hover:border-white/40 hover:text-white"
                >
                  {f.q}
                </button>
              ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = input.trim();
              if (!text) return;
              setInput("");
              reply(text, { from: "bot", text: b.handoff, wa: text });
            }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-4 pr-1"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={b.placeholder}
              aria-label={b.placeholder}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
            />
            <button
              type="submit"
              aria-label={copy2[lang].send}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.aside>
    </>
  );
}
