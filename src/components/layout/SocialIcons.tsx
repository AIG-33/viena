import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function TelegramGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor" {...props}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.009-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function InstagramGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor" {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.06 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.36 1.06.42 2.23.05 1.27.07 1.65.07 4.85s-.02 3.58-.07 4.85c-.06 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.36-2.23.42-1.27.05-1.65.07-4.85.07s-3.58-.02-4.85-.07c-1.17-.06-1.8-.25-2.23-.42-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.17-.43-.36-1.06-.42-2.23C2.18 15.58 2.16 15.2 2.16 12s.02-3.58.07-4.85c.06-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.17 1.06-.36 2.23-.42C8.42 2.18 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z" />
      <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </svg>
  );
}

function FacebookGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor" {...props}>
      <path d="M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.08 1.85-5.97 5.86-5.97.4 0 .96.04 1.47.1.4.05.81.13 1.14.2v3.32a8.6 8.6 0 0 0-.65-.04 26.8 26.8 0 0 0-.73-.01c-.71 0-1.26.1-1.68.31-.3.16-.53.36-.68.62-.26.42-.37 1-.37 1.75v1.3h3.92l-.39 2.1-.29 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04 24 5.42 18.63.05 12 .05S0 5.42 0 12.04c0 5.63 3.87 10.35 9.1 11.65z" />
    </svg>
  );
}

function LinkedInGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.44-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export type SocialNetwork = "telegram" | "instagram" | "facebook" | "linkedin";

const REGISTRY: Record<
  SocialNetwork,
  { label: string; Icon: ComponentType<IconProps>; brand: string }
> = {
  telegram: { label: "Telegram", Icon: TelegramGlyph, brand: "#229ED9" },
  instagram: { label: "Instagram", Icon: InstagramGlyph, brand: "#E1306C" },
  facebook: { label: "Facebook", Icon: FacebookGlyph, brand: "#1877F2" },
  linkedin: { label: "LinkedIn", Icon: LinkedInGlyph, brand: "#0A66C2" },
};

export type SocialLink = {
  network: SocialNetwork;
  url: string;
  label?: string;
};

export function SocialIcons({
  links,
  size = "md",
  className,
}: {
  links: SocialLink[];
  size?: "sm" | "md";
  className?: string;
}) {
  const tile =
    size === "sm"
      ? "w-9 h-9 rounded-xl"
      : "w-10 h-10 rounded-[14px]";
  const glyph = size === "sm" ? "w-[15px] h-[15px]" : "w-[17px] h-[17px]";

  return (
    <ul
      className={[
        "flex items-center gap-2",
        className ?? "",
      ].join(" ")}
    >
      {links.map((link) => {
        const meta = REGISTRY[link.network];
        const Icon = meta.Icon;
        const label = link.label ?? meta.label;
        return (
          <li key={link.network}>
            <a
              href={link.url}
              aria-label={label}
              title={label}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel={link.url.startsWith("http") ? "noreferrer noopener" : undefined}
              className={[
                tile,
                "group relative inline-grid place-items-center overflow-hidden",
                "bg-white text-ink-700 ring-1 ring-paper-200",
                "transition-[color,transform,box-shadow] duration-200 ease-out",
                "hover:-translate-y-0.5 hover:text-white hover:ring-transparent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              ].join(" ")}
              style={{
                ["--social-brand" as string]: meta.brand,
              }}
            >
              {/* Brand-tinted gradient that fades in on hover */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                style={{
                  background:
                    link.network === "instagram"
                      ? "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #515bd4 100%)"
                      : `linear-gradient(135deg, var(--social-brand) 0%, color-mix(in oklab, var(--social-brand) 78%, #000) 100%)`,
                  boxShadow:
                    "0 8px 22px -8px color-mix(in oklab, var(--social-brand) 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              />
              <Icon className={`${glyph} relative z-[1]`} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
