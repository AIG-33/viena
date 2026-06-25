/**
 * Visible breadcrumb navigation + `BreadcrumbList` JSON-LD in one component.
 *
 * Usage:
 *   <Breadcrumbs
 *     items={[
 *       { name: tNav("home"), href: "/" },
 *       { name: t("catalog"), href: "/catalog" },
 *       { name: cat.name, href: `/catalog/${cat.id}` },
 *     ]}
 *   />
 *
 * Conventions:
 *   - `href` is a locale-LESS path (e.g. "/about"). The component prefixes
 *     it with the active locale via `localePath` for the JSON-LD URL and
 *     uses next-intl's `<Link>` to render the visible link.
 *   - The last item is always rendered as plain text (no link) with
 *     `aria-current="page"`.
 *   - By default the component renders inside a thin white bar that sits
 *     between the page hero and the rest of the page. Use `variant="inline"`
 *     to skip the bar wrapper when embedding inside a custom hero/section.
 *   - Always pair this with a unique `<title>` and a clear `<h1>` on the
 *     same page (already enforced by `generateMetadata` + `PageHero`).
 */
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, localePath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export interface BreadcrumbItem {
  /** Visible label, already translated by the caller. */
  name: string;
  /** Locale-LESS path. Last item still needs `href` so the JSON-LD list is complete. */
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /**
   * `"bar"` (default) — wrap in a slim white bar with bottom border, full-width.
   * `"inline"` — render only the `<nav>` element so callers can embed it
   *              inside a custom hero/section.
   */
  variant?: "bar" | "inline";
  className?: string;
}

export async function Breadcrumbs({
  items,
  variant = "bar",
  className,
}: BreadcrumbsProps) {
  if (!items?.length) return null;
  const locale = (await getLocale()) as Locale;

  const jsonLd = buildBreadcrumbJsonLd(
    items.map((it) => ({ name: it.name, url: localePath(locale, it.href) }))
  );

  const nav = (
    <nav
      aria-label="Breadcrumb"
      className={`text-[12px] md:text-[13px] text-ink-500 ${className ?? ""}`}
    >
      <ol className="flex items-center gap-1.5 md:gap-2 flex-wrap">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${it.href}-${i}`} className="flex items-center gap-1.5 md:gap-2 min-w-0">
              {!isLast ? (
                <Link
                  href={it.href}
                  className="hover:text-green-700 transition-colors"
                >
                  {it.name}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="text-ink-900 font-medium truncate max-w-[60vw] md:max-w-none"
                >
                  {it.name}
                </span>
              )}
              {!isLast && (
                <span className="text-ink-400" aria-hidden>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  if (variant === "inline") {
    return (
      <>
        <JsonLd data={jsonLd} />
        {nav}
      </>
    );
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="bg-white border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14 py-2.5 md:py-3">
          {nav}
        </div>
      </section>
    </>
  );
}
