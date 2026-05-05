import Image from "next/image";
import { cn } from "@/lib/utils";

interface ManufacturerWordmarkProps {
  name: string;
  logo?: string;
  className?: string;
  variant?: "card" | "hero" | "compact";
}

const COLORS = [
  "from-green-100 to-green-50 text-green-800",
  "from-sky-100 to-sky-50 text-sky-800",
  "from-amber-50 to-amber-100/60 text-amber-800",
  "from-violet-100 to-violet-50 text-violet-800",
  "from-rose-100 to-rose-50 text-rose-800",
  "from-teal-100 to-teal-50 text-teal-800",
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function ManufacturerWordmark({
  name,
  logo,
  className,
  variant = "card",
}: ManufacturerWordmarkProps) {
  const palette = COLORS[hashString(name) % COLORS.length];
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  const aspectClass = isHero
    ? "aspect-[3/2]"
    : isCompact
    ? "h-12"
    : "aspect-[4/3]";

  if (logo) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white border border-paper-200 grid place-items-center",
          aspectClass,
          className
        )}
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          fill={!isCompact}
          width={isCompact ? 140 : undefined}
          height={isCompact ? 48 : undefined}
          className={cn(
            "object-contain",
            isCompact ? "p-1" : isHero ? "p-4 md:p-8" : "p-2"
          )}
          sizes="(max-width:768px) 50vw, 25vw"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br grid place-items-center",
        palette,
        aspectClass,
        className
      )}
      aria-hidden
    >
      <span
        className={cn(
          "font-display font-bold tracking-tight px-4 text-center leading-tight",
          isHero
            ? "text-4xl md:text-6xl"
            : isCompact
            ? "text-base"
            : "text-2xl md:text-3xl"
        )}
      >
        {name}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, currentColor 0.5px, transparent 0.5px)",
          backgroundSize: "16px 16px",
        }}
      />
    </div>
  );
}
