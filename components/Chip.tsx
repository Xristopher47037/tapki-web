import { Plus, type LucideIcon } from "lucide-react";

// Black disc with a white ring, like the Tapki mark, carrying one product icon.
export default function Chip({
  icon: Icon = Plus,
  className,
  style,
}: {
  icon?: LucideIcon;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#3a3a3a,#000_70%)] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)] ${className ?? ""}`}
      style={style}
    >
      <span className="flex h-[80%] w-[80%] items-center justify-center rounded-full border-[max(1.5px,0.07em)] border-white text-white">
        <Icon className="h-[52%] w-[52%]" strokeWidth={2.25} />
      </span>
    </span>
  );
}
