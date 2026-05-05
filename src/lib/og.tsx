/* eslint-disable @next/next/no-img-element */
/**
 * Shared building blocks for `opengraph-image.tsx` route handlers.
 *
 * Every OG variant follows the same visual grid (1200×630 with brand
 * gradient + bottom-left brand strip). Pages just pass the headline /
 * eyebrow / optional accent image and get back a ready `ImageResponse`
 * payload.
 *
 * Constants are exported so individual OG routes don't have to repeat
 * the brand colour palette.
 */
import type { ReactElement } from "react";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_CONTENT_TYPE = "image/png";

export const BRAND = {
  green: "#22c58e",
  greenDark: "#0e8f66",
  ink: "#1b1e21",
  inkSoft: "#3d4748",
  paper: "#fafbfc",
  paperSoft: "#f4f6f7",
};

export interface OgFrameProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accentImageUrl?: string | null;
  brand?: string;
}

/**
 * Renders the standard OG frame as JSX for `next/og` `ImageResponse`.
 *
 * `accentImageUrl` is optional — when present it's rendered on the right
 * side at 480×480 inside a soft card. Passing `null` keeps the layout
 * centred on the headline.
 */
export function OgFrame({
  eyebrow,
  title,
  subtitle,
  accentImageUrl,
  brand = "ВИЕНА МЕДИКАЛ",
}: OgFrameProps): ReactElement {
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: `linear-gradient(135deg, ${BRAND.paper} 0%, #ffffff 55%, ${BRAND.green}25 100%)`,
        position: "relative",
        fontFamily: "Helvetica, Arial, sans-serif",
        color: BRAND.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: BRAND.greenDark,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: BRAND.green,
              display: "flex",
            }}
          />
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: BRAND.ink,
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {brand}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 56,
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: title.length > 70 ? 56 : 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: BRAND.ink,
              display: "flex",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: BRAND.inkSoft,
                lineHeight: 1.35,
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {accentImageUrl ? (
          <div
            style={{
              width: 360,
              height: 360,
              borderRadius: 32,
              background: BRAND.paperSoft,
              border: `1px solid ${BRAND.paper}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 28,
              flexShrink: 0,
            }}
          >
            <img
              src={accentImageUrl}
              alt=""
              width={300}
              height={300}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 32,
          fontSize: 20,
          color: BRAND.inkSoft,
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          <span style={{ display: "flex" }}>viena.by</span>
          <span style={{ display: "flex", color: BRAND.green }}>·</span>
          <span style={{ display: "flex" }}>+375 29 392 02 73</span>
        </div>
        <div
          style={{
            display: "flex",
            background: BRAND.green,
            color: "#fff",
            padding: "8px 18px",
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          B2B · Belarus
        </div>
      </div>
    </div>
  );
}

/**
 * Returns an absolute, cache-busted URL safe for `<img src>` inside an
 * `ImageResponse`. Relative paths are rewritten against `NEXT_PUBLIC_SITE_URL`.
 */
export function ogAbsoluteUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://viena.by";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
