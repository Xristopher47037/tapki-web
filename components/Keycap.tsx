export default function Keycap({
  cap,
  base,
  className,
  style,
}: {
  cap: string;
  base: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={{ position: "relative", ...style }} aria-hidden>
      <div className="absolute inset-x-[10%] bottom-0 h-[38%] rounded-[14%]" style={{ background: base }} />
      <div
        className="absolute inset-x-[7%] top-[30%] h-[38%]"
        style={{
          background: `linear-gradient(180deg, ${cap} 0%, color-mix(in srgb, ${cap} 68%, black) 100%)`,
          clipPath: "polygon(0% 0%, 100% 0%, 88% 100%, 12% 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[34%] rounded-[22%]"
        style={{
          background: `linear-gradient(150deg, color-mix(in srgb, ${cap} 72%, white) 0%, ${cap} 62%, color-mix(in srgb, ${cap} 80%, black) 100%)`,
        }}
      />
      <div
        className="absolute left-1/2 top-[8%] h-[12%] w-[46%] -translate-x-1/2 rounded-full"
        style={{ background: "rgba(255,255,255,0.32)" }}
      />
    </div>
  );
}
