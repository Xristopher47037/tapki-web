export const u = (px: number) => `${((px / 1440) * 100).toFixed(4)}cqw`;
export const uy = (px: number) => `${((px / 810) * 100).toFixed(4)}%`;

export const EASE = [0.16, 1, 0.3, 1] as const;

export const reveal = (index: number, reduceMotion: boolean | null) =>
  reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay: 0.1 + index * 0.08, ease: EASE },
      };

export const WHATSAPP = "573135706710";
export const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// Gray keycaps for the "[ ]" bracket (one per product + an empty slot for what comes next)
export const SWITCHES = [
  { left: 17.14, width: 38.671, height: 49.319, cap: "#1a1a1a", base: "#4a4a4a" },
  { left: 54.82, width: 34.549, height: 43.16, cap: "#f4f4f4", base: "#5c5c5c" },
  { left: 88.36, width: 32.864, height: 53.131, cap: "#7d7d7d", base: "#2a2a2a" },
  { left: 120.23, width: 35.391, height: 46.972, cap: "#d2d2d2", base: "#3a3a3a" },
  { left: 154.62, width: 41.423, height: 46.227, cap: "#3c3c3c", base: "#111111" },
];

export const FEATURE_CARD_TOP = 703.476;
export const FEATURE_CARD_HEIGHT = 106.524;
