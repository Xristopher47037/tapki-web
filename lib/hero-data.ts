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

export const FEATURE_CARD_TOP = 703.476;
export const FEATURE_CARD_HEIGHT = 106.524;
