"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Chip from "@/components/Chip";
import { LangToggle, useLang } from "@/components/Lang";
import { copy, projects } from "@/lib/content";
import { EASE, FEATURE_CARD_HEIGHT, FEATURE_CARD_TOP, reveal, u, uy, wa } from "@/lib/hero-data";

type RM = boolean | null;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}

const MENU_ITEMS = (lang: "es" | "en") => [
  { href: "#inicio", label: copy[lang].home, hint: copy[lang].menuHint },
  ...projects.map((p) => ({ href: `#${p.id}`, label: p.name, hint: p.niche[lang] })),
];

export default function Hero() {
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion();
  if (isDesktop === false)
    return (
      <section id="inicio" className="w-full bg-[var(--background)]">
        <MobileStage reduceMotion={reduceMotion} />
      </section>
    );
  return (
    <section id="inicio" className="h-dvh w-full overflow-hidden bg-[var(--background)]">
      <HeroStage reduceMotion={reduceMotion} />
    </section>
  );
}

/* Animated gray backdrop: the Tapki mark with NFC ripples, a slow dashed orbit and a gentle float. */
function Pulse({ reduceMotion, size }: { reduceMotion: RM; size: string }) {
  return (
    <motion.div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={i}
          className={`absolute inset-0 rounded-full ${i % 2 ? "border border-black/20" : "border-2 border-white/70"}`}
          initial={{ opacity: 0 }}
          animate={reduceMotion ? { opacity: 0 } : { scale: [1, 2.5], opacity: [0.8, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: i, ease: "easeOut" }}
        />
      ))}
      <motion.span
        className="absolute inset-[-14%] rounded-full border border-dashed border-black/25"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60" />
      </motion.span>
      <motion.span
        className="absolute inset-[-32%] rounded-full border border-dotted border-white/70"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 bottom-0 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow" />
        <span className="absolute right-[14.6%] top-[14.6%] h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50" />
      </motion.span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpg"
        alt=""
        className="relative h-full w-full rounded-full shadow-[0_50px_100px_-30px_rgba(0,0,0,0.65)]"
      />
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.2),transparent_55%)]" />
      {/* Radar-like light sweep across the mark */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,transparent_75%,rgba(255,255,255,0.22)_96%,transparent_100%)] mix-blend-screen"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

/* Small gray specks drifting slowly across the stage, like signal in the air. */
const SPECKS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 3 + (i % 4) * 2,
  dark: i % 3 === 0,
  duration: 9 + (i % 5) * 3,
  delay: (i % 7) * 0.9,
}));

function Specks({ reduceMotion }: { reduceMotion: RM }) {
  if (reduceMotion) return null;
  return (
    <div className="pointer-events-none absolute inset-0">
      {SPECKS.map((s, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full ${s.dark ? "bg-black/25" : "bg-white/80"}`}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ y: [0, -60, 0], x: [0, i % 2 ? 24 : -24, 0], opacity: [0, 1, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Glow({ reduceMotion, className, drift }: { reduceMotion: RM; className: string; drift: number }) {
  return (
    <motion.div
      className={`absolute inset-0 rounded-full ${className}`}
      animate={reduceMotion ? undefined : { x: [0, drift, 0], y: [0, -drift / 2, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ------------------------------------------------------------------ desktop */

const SPRING = { stiffness: 55, damping: 20, mass: 0.7 };

function HeroStage({ reduceMotion }: { reduceMotion: RM }) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, SPRING);
  const springY = useSpring(pointerY, SPRING);
  const range = (depth: number) => (reduceMotion ? [0, 0] : [-depth, depth]);

  const videoX = useTransform(springX, [-1, 1], range(26));
  const videoY = useTransform(springY, [-1, 1], range(18));
  const glowX = useTransform(springX, [-1, 1], range(38));
  const glowY = useTransform(springY, [-1, 1], range(26));
  const cardsX = useTransform(springX, [-1, 1], range(10));
  const cardsY = useTransform(springY, [-1, 1], range(7));

  return (
    <motion.div
      className="@container relative h-full w-full overflow-hidden bg-[#cfcfcf]"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
        pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <Backdrop reduceMotion={reduceMotion} videoX={videoX} videoY={videoY} glowX={glowX} glowY={glowY} />
      <FeatureTabs reduceMotion={reduceMotion} />
      <Paragraph reduceMotion={reduceMotion} />
      <Headline reduceMotion={reduceMotion} />
      <StatCards reduceMotion={reduceMotion} x={cardsX} y={cardsY} />
      <CtaRow reduceMotion={reduceMotion} />
      <Counter reduceMotion={reduceMotion} />
      <Navigation reduceMotion={reduceMotion} />
    </motion.div>
  );
}

function Backdrop({
  reduceMotion,
  videoX,
  videoY,
  glowX,
  glowY,
}: {
  reduceMotion: RM;
  videoX: MotionValue<number>;
  videoY: MotionValue<number>;
  glowX: MotionValue<number>;
  glowY: MotionValue<number>;
}) {
  return (
    <>
      <motion.div
        style={{ x: videoX, y: videoY, right: u(-38.22), top: uy(-75.48), width: u(768.436), height: uy(909.302) }}
        className="absolute flex items-center justify-center"
      >
        <Pulse reduceMotion={reduceMotion} size={u(420)} />
      </motion.div>
      <motion.div
        style={{ x: glowX, y: glowY, left: u(-488.15), top: uy(-402.37), width: u(1027.264), height: uy(1329.332) }}
        className="pointer-events-none absolute"
      >
        <Glow
          reduceMotion={reduceMotion}
          drift={40}
          className="bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),rgba(255,255,255,0.45)_45%,transparent)]"
        />
      </motion.div>
      <motion.div
        style={{ x: glowX, y: glowY, left: u(805.17), top: uy(318.9), width: u(920.218), height: uy(909.212) }}
        className="pointer-events-none absolute flex items-center justify-center mix-blend-screen"
      >
        <div className="relative" style={{ width: u(679.63), height: uy(640.889), transform: "rotate(-33.41deg)" }}>
          <Glow
            reduceMotion={reduceMotion}
            drift={-30}
            className="bg-[radial-gradient(closest-side,rgba(255,255,255,0.55),transparent)]"
          />
        </div>
      </motion.div>
      <motion.div style={{ x: glowX, y: glowY }} className="pointer-events-none absolute inset-0">
        <Specks reduceMotion={reduceMotion} />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[#6b6b6b] mix-blend-soft-light" />
    </>
  );
}

function Navigation({ reduceMotion }: { reduceMotion: RM }) {
  const { lang } = useLang();
  const t = copy[lang];
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const duration = reduceMotion ? 0 : 0.4;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const strokeCommon: React.CSSProperties = {
    position: "absolute",
    height: "13.38%",
    background: "#000000",
    borderRadius: "9999px",
    display: "block",
  };
  const strokeTransition = { duration, ease: EASE };
  const links = [
    { edge: 676, label: "Menu", href: "#menu" },
    { edge: 771, label: "Control", href: "#control" },
    { edge: 849, label: "Card", href: "#card" },
    { edge: 930, label: "Vendedor", href: "#vendedor" },
  ];

  return (
    <motion.nav {...reveal(0, reduceMotion)} className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={() => setOpen(false)}
            className="pointer-events-auto absolute inset-0 z-20 bg-black/25 backdrop-blur-[6px]"
          />
        )}
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: reduceMotion ? 0 : -14, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration, ease: EASE }}
            className="pointer-events-auto absolute z-30 flex flex-col bg-white/85 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)] backdrop-blur-[30px]"
            style={{ right: u(30.6), top: u(82), width: u(360), borderRadius: u(32), padding: u(28), gap: u(6) }}
          >
            {MENU_ITEMS(lang).map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, delay: 0.06 + i * 0.05, ease: EASE }}
                className="group flex items-center justify-between rounded-full transition-colors hover:bg-black/[0.06]"
                style={{ padding: `${u(10)} ${u(16)}`, gap: u(12) }}
              >
                <span className="flex flex-col" style={{ gap: u(2) }}>
                  <span
                    className="font-display font-medium uppercase text-black"
                    style={{ fontSize: u(20), letterSpacing: u(-0.4), lineHeight: 1.1 }}
                  >
                    {item.label}
                  </span>
                  <span className="font-display font-medium text-black/45" style={{ fontSize: u(12), lineHeight: 1.2 }}>
                    {item.hint}
                  </span>
                </span>
                <span
                  className="flex shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ width: u(32), height: u(32) }}
                >
                  <ArrowUpRight strokeWidth={2} style={{ width: u(15), height: u(15) }} />
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? t.closeMenu : t.openMenu}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto absolute z-40 flex items-center justify-center rounded-full bg-white transition-transform hover:scale-[1.05]"
        style={{ right: u(30.6), top: u(13), width: u(56), height: u(56) }}
      >
        <span className="relative block" style={{ width: u(31.489), height: u(14.945) }}>
          <motion.span
            style={{ ...strokeCommon, left: 0 }}
            initial={false}
            animate={open ? { top: "43.3%", width: "100%", rotate: 45 } : { top: "0%", width: "50%", rotate: 0 }}
            transition={strokeTransition}
          />
          <motion.span
            style={{ ...strokeCommon, top: "43.3%", left: 0, width: "100%" }}
            initial={false}
            animate={open ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }}
            transition={strokeTransition}
          />
          <motion.span
            style={{ ...strokeCommon, right: 0 }}
            initial={false}
            animate={open ? { top: "43.3%", width: "100%", rotate: -45 } : { top: "86.6%", width: "50%", rotate: 0 }}
            transition={strokeTransition}
          />
        </span>
      </button>

      <LangToggle
        className="tbox pointer-events-auto absolute flex items-center rounded-full bg-white/70 font-display font-medium backdrop-blur-sm transition-colors hover:bg-white"
        style={{ right: u(100), top: u(24), height: u(34), paddingLeft: u(14), paddingRight: u(14), gap: u(4), fontSize: u(12) }}
      />

      <a
        href="#inicio"
        aria-label="Tapki"
        className="pointer-events-auto absolute overflow-hidden rounded-full"
        style={{ left: u(30.6), top: u(12), width: u(60), height: u(60) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="Tapki" className="h-full w-full" />
      </a>

      <a
        href="#inicio"
        className="tbox pointer-events-auto absolute flex items-center rounded-full bg-white font-display text-black"
        style={{ left: u(510), top: u(24), height: u(34), paddingLeft: u(14), paddingRight: u(14), fontSize: u(12) }}
      >
        {t.home}
      </a>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="tbox pointer-events-auto absolute flex items-center font-display text-black/80 transition-colors hover:text-black"
          style={{ right: u(1440 - link.edge), top: u(24), height: u(34), fontSize: u(12) }}
        >
          {link.label}
        </a>
      ))}
    </motion.nav>
  );
}

const HEADLINE_TYPE = { fontSize: u(61.411), lineHeight: 1, letterSpacing: u(-1.8423) };

function Headline({ reduceMotion }: { reduceMotion: RM }) {
  const { lang } = useLang();
  const t = copy[lang];
  const line = "tbox absolute block whitespace-nowrap font-display font-normal uppercase text-black";
  return (
    <motion.h1 {...reveal(1, reduceMotion)} className="pointer-events-none absolute inset-0">
      <span className={line} style={{ ...HEADLINE_TYPE, left: u(65.63), top: uy(201.66) }}>
        {t.headline[0]}
      </span>
      <span className={line} style={{ ...HEADLINE_TYPE, left: u(158.26), top: uy(262.64) }}>
        {t.headline[1]}
      </span>
      {/* Line three and the badge share a row so the badge follows the word in either language. */}
      <span className="absolute flex items-center" style={{ left: u(113.97), top: uy(323.61), gap: u(22) }}>
        <span className="tbox block whitespace-nowrap font-display font-normal uppercase text-black" style={HEADLINE_TYPE}>
          {t.headline[2]}
        </span>
        <motion.span
          {...reveal(3, reduceMotion)}
          className="flex items-center rounded-full border border-white/40 bg-white/30 backdrop-blur-sm"
          style={{ height: u(26.608), paddingLeft: u(4), paddingRight: u(12), gap: u(8) }}
        >
          <span className="shrink-0 rounded-full bg-black" style={{ width: u(18.608), height: u(18.608) }} />
          <span
            className="tbox font-display font-medium whitespace-nowrap normal-case text-black/60"
            style={{ fontSize: u(14), lineHeight: 1.2, letterSpacing: u(-0.14) }}
          >
            {t.badge}
          </span>
        </motion.span>
      </span>
    </motion.h1>
  );
}


function Paragraph({ reduceMotion }: { reduceMotion: RM }) {
  const { lang } = useLang();
  const t = copy[lang];
  return (
    <motion.p
      {...reveal(4, reduceMotion)}
      className="tbox absolute font-display font-medium text-black"
      style={{ left: u(105.22), top: uy(437.69), width: u(460), fontSize: u(18), lineHeight: 1.2, letterSpacing: u(-0.18) }}
    >
      {t.paragraph[0]}
      <br />
      {t.paragraph[1]}
    </motion.p>
  );
}

function CtaRow({ reduceMotion }: { reduceMotion: RM }) {
  const { lang } = useLang();
  const t = copy[lang];
  const type = { fontSize: u(18), letterSpacing: u(-0.18) };
  return (
    <motion.div
      {...reveal(5, reduceMotion)}
      className="absolute flex items-center"
      style={{ left: u(107.69), top: uy(527.9), gap: u(14) }}
    >
      <a
        href={wa(t.wantInfo)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center rounded-full bg-black font-display font-semibold whitespace-nowrap text-white transition-transform hover:scale-[1.03]"
        style={{ ...type, height: u(60), paddingLeft: u(30), paddingRight: u(30) }}
      >
        {t.demo}
      </a>
      <a
        href={wa(t.wantInfo)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex shrink-0 items-center justify-center rounded-full bg-white transition-transform hover:scale-[1.05]"
        style={{ width: u(60), height: u(60) }}
      >
        <ArrowUpRight strokeWidth={2} style={{ width: u(19.235), height: u(19.235) }} />
      </a>
      <a
        href="#productos"
        className="flex items-center justify-center rounded-full border border-black font-display font-semibold whitespace-nowrap text-black transition-colors hover:bg-black/5"
        style={{ ...type, height: u(60), paddingLeft: u(30), paddingRight: u(30) }}
      >
        {t.explore}
      </a>
    </motion.div>
  );
}

function WavesIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 68 68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} style={style} aria-hidden>
      <circle cx="34" cy="34" r="32" opacity="0.35" />
      <circle cx="27" cy="41" r="5" fill="currentColor" stroke="none" />
      <path d="M36 32a12 12 0 0 1 0 18" transform="rotate(-45 27 41)" />
      <path d="M41 26a20 20 0 0 1 0 30" transform="rotate(-45 27 41)" />
      <path d="M46 20a28 28 0 0 1 0 42" transform="rotate(-45 27 41)" />
    </svg>
  );
}

function Counter({ reduceMotion }: { reduceMotion: RM }) {
  const { lang } = useLang();
  const c = copy[lang].counter;
  return (
    // One flex row anchored to the bottom edge, so value and label never collide at wide aspect ratios.
    <motion.div
      {...reveal(7, reduceMotion)}
      className="pointer-events-none absolute flex items-center font-display text-black"
      style={{ left: u(27), bottom: u(22), gap: u(28) }}
    >
      <WavesIcon style={{ width: u(68), height: u(68) }} />
      <span className="flex flex-col" style={{ gap: u(10) }}>
        <span className="tbox flex items-baseline">
          <span className="font-light" style={{ fontSize: u(61.411), lineHeight: 1, letterSpacing: u(-1.8423) }}>
            {c.value}
          </span>
          <span className="font-extralight" style={{ fontSize: u(41.084), lineHeight: 1, letterSpacing: u(-1.2325) }}>
            {c.suffix}
          </span>
        </span>
        <span className="tbox font-medium whitespace-nowrap" style={{ fontSize: u(14), lineHeight: 1.2, letterSpacing: u(-0.14) }}>
          {c.label}
        </span>
      </span>
    </motion.div>
  );
}

function StatCards({ reduceMotion, x, y }: { reduceMotion: RM; x: MotionValue<number>; y: MotionValue<number> }) {
  const { lang } = useLang();
  const stats = copy[lang].stats;
  const boxes = [
    { left: 1090.98, top: 182.22, width: 280.933 },
    { left: 725.25, top: 443.3, width: 273.933 },
  ];
  return (
    <motion.div {...reveal(6, reduceMotion)} style={{ x, y }} className="pointer-events-none absolute inset-0">
      {boxes.map((box, i) => (
        <div
          key={i}
          className="absolute flex flex-col justify-center bg-[rgba(20,20,20,0.38)] text-white backdrop-blur-[40px]"
          style={{
            left: u(box.left),
            top: uy(box.top),
            width: u(box.width),
            height: u(160.858),
            borderRadius: u(40),
            padding: u(42.467),
            gap: u(15.925),
          }}
        >
          <span className="tbox font-display font-light uppercase" style={HEADLINE_TYPE}>
            {stats[i].value}
          </span>
          <span className="tbox font-display font-medium" style={{ fontSize: u(24), lineHeight: 1.2, letterSpacing: u(-0.24) }}>
            {stats[i].label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

const CUT = "polygon(0% 34%, 7% 0%, 100% 0%, 100% 100%, 0% 100%)";

function FeatureTabs({ reduceMotion }: { reduceMotion: RM }) {
  const { lang } = useLang();
  const tabs = copy[lang].tabs;
  // `visible` = the part of each tab not covered by the next one; content lives only there.
  const features = [
    { id: "menu", left: 632.37, width: 407.235, visible: 296.77, dark: true },
    { id: "control", left: 929.14, width: 307.235, visible: 202.38, dark: false },
    { id: "card", left: 1131.52, width: 307.235, visible: 307.235, dark: false },
  ];
  return (
    <motion.div {...reveal(8, reduceMotion)} className="pointer-events-none absolute inset-0">
      {features.map((f, i) => (
        <a
          key={f.id}
          href={`#${f.id}`}
          className={`pointer-events-auto absolute transition-opacity hover:opacity-90 ${
            f.dark ? "bg-[#f4f4f4] text-black" : "bg-[rgba(20,20,20,0.55)] text-[#fffcfc] backdrop-blur-[24px]"
          }`}
          style={{ left: u(f.left), top: uy(FEATURE_CARD_TOP), width: u(f.width), height: uy(FEATURE_CARD_HEIGHT), clipPath: CUT }}
        >
          <span
            className="absolute inset-y-0 flex items-center"
            style={{ left: u(34), width: u(f.visible - 50), gap: u(12) }}
          >
            <Chip icon={projects[i].icon} style={{ width: u(46), height: u(46) }} />
            <span
              className="font-display font-medium"
              style={{ fontSize: u(16), lineHeight: 1.15, letterSpacing: u(-0.16) }}
            >
              {tabs[i]}
            </span>
          </span>
        </a>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------- mobile */

function MobileStage({ reduceMotion }: { reduceMotion: RM }) {
  const { lang } = useLang();
  const t = copy[lang];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 70]);
  const glowY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 110]);
  const d = reduceMotion ? 0 : 0.35;
  const stroke = "absolute left-0 block h-[2px] rounded-full bg-black";

  return (
    <motion.div ref={sectionRef} className="relative min-h-dvh overflow-hidden bg-[#cfcfcf] px-5 pb-10 pt-6">
      <motion.div style={{ y: videoY }} className="pointer-events-none absolute -right-12 top-16 opacity-90">
        <Pulse reduceMotion={reduceMotion} size="210px" />
      </motion.div>
      <motion.div
        style={{ y: glowY }}
        className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#ffffff] opacity-60 blur-[90px]"
      />
      <Specks reduceMotion={reduceMotion} />
      <div className="pointer-events-none absolute inset-0 bg-[#6b6b6b] mix-blend-soft-light" />

      <div className="relative flex flex-col gap-6">
        <motion.div {...reveal(0, reduceMotion)}>
          <div className="flex items-center justify-between">
            <a href="#inicio" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="" className="h-9 w-9 rounded-full" />
              <span className="font-display text-sm font-semibold">Tapki</span>
            </a>
            <div className="flex items-center gap-2">
              <LangToggle className="flex h-9 items-center gap-1 rounded-full bg-white/70 px-3 font-display text-xs font-medium backdrop-blur-sm" />
              <button
                type="button"
                aria-label={menuOpen ? t.closeMenu : t.openMenu}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
              >
                <span className="relative block h-6 w-7">
                  <motion.span
                    className={stroke}
                    initial={false}
                    animate={menuOpen ? { top: "43%", width: "100%", rotate: 45 } : { top: "18%", width: "60%", rotate: 0 }}
                    transition={{ duration: d, ease: EASE }}
                  />
                  <motion.span
                    className={`${stroke} top-[43%] w-full`}
                    initial={false}
                    animate={{ opacity: menuOpen ? 0 : 1 }}
                    transition={{ duration: d, ease: EASE }}
                  />
                  <motion.span
                    className={stroke}
                    initial={false}
                    animate={menuOpen ? { top: "43%", width: "100%", rotate: -45 } : { top: "68%", width: "60%", rotate: 0 }}
                    transition={{ duration: d, ease: EASE }}
                  />
                </span>
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {menuOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: d, ease: EASE }}
                className="mt-3 overflow-hidden rounded-[20px] bg-white/70 backdrop-blur-md"
              >
                {MENU_ITEMS(lang).map((item) => (
                  <li key={item.href} className="border-b border-black/5 last:border-b-0">
                    <a href={item.href} onClick={() => setMenuOpen(false)} className="flex flex-col px-5 py-3">
                      <span className="font-display font-medium uppercase">{item.label}</span>
                      <span className="font-display text-xs text-black/45">{item.hint}</span>
                    </a>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.h1
          {...reveal(1, reduceMotion)}
          className="mt-52 font-display text-[clamp(2rem,10vw,3rem)] font-normal uppercase leading-[1] tracking-[-0.03em]"
        >
          {t.headline.join(" ")}
        </motion.h1>

        <motion.div
          {...reveal(3, reduceMotion)}
          className="flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/30 py-1 pl-1 pr-3 backdrop-blur-sm"
        >
          <span className="h-5 w-5 shrink-0 rounded-full bg-black" />
          <span className="font-display text-sm font-medium text-black/60">{t.badge}</span>
        </motion.div>

        <motion.p {...reveal(4, reduceMotion)} className="font-display text-base font-medium">
          {t.paragraph[0]} {t.paragraph[1]}
        </motion.p>

        <motion.div {...reveal(5, reduceMotion)} className="flex flex-wrap gap-2">
          <a
            href={wa(t.wantInfo)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[54px] items-center rounded-full bg-black px-6 font-display font-semibold text-white"
          >
            {t.demo}
          </a>
          <a
            href={wa(t.wantInfo)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white"
          >
            <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
          </a>
          <a href="#productos" className="flex h-[54px] items-center rounded-full border border-black px-6 font-display font-semibold">
            {t.explore}
          </a>
        </motion.div>

        <motion.div {...reveal(6, reduceMotion)} className="grid grid-cols-2 gap-3">
          {t.stats.map((s) => (
            <div key={s.value} className="flex flex-col gap-2 rounded-[24px] bg-[rgba(20,20,20,0.7)] p-5 text-white">
              <span className="font-display text-4xl font-light uppercase leading-none">{s.value}</span>
              <span className="font-display text-sm font-medium">{s.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div {...reveal(7, reduceMotion)} className="flex items-center gap-3">
          <WavesIcon className="h-12 w-12 text-black" />
          <div className="font-display">
            <span className="text-4xl font-light leading-none">{t.counter.value}</span>
            <span className="text-3xl font-extralight">{t.counter.suffix}</span>
            <p className="text-sm font-medium">{t.counter.label}</p>
          </div>
        </motion.div>

        <motion.div {...reveal(8, reduceMotion)} className="flex flex-col gap-2">
          {t.tabs.map((title, i) => (
            <a
              key={title}
              href={`#${projects[i].id}`}
              className={`flex items-center gap-3 rounded-[18px] px-4 py-3 font-display font-medium ${
                i === 0 ? "bg-white text-black" : "bg-[rgba(20,20,20,0.55)] text-[#fffcfc]"
              }`}
            >
              <Chip icon={projects[i].icon} className="h-9 w-9" />
              <span>
                {projects[i].name} · {title}
              </span>
            </a>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
