import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllManufacturers } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

const PARTNER_SLUGS = [
  "greiner-bio-one",
  "lianfa",
  "biovitrum",
  "bionote",
  "amplisens",
  "seamaty",
  "microlit",
  "tianlong",
  "huida",
];

const BENEFIT_ICONS = [
  "M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z",
  "M5 12l5 5 9-11",
  "M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1z",
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18",
];

export async function TrustBand() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.trustBand");
  const all = getAllManufacturers(locale);
  const partners = PARTNER_SLUGS.map((slug) =>
    all.find((m) => m.slug === slug)
  ).filter((m): m is NonNullable<typeof m> => Boolean(m));
  const benefits = t.raw("benefits") as { title: string; desc: string }[];

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <span className="eyebrow">
            <span className="pill">{t("eyebrowPill")}</span>
            {t("eyebrowText")}
          </span>
          <Link
            href="/manufacturers"
            className="text-[12px] font-mono text-ink-500 hover:text-green-700 transition-colors"
          >
            {t("titleArrow")}
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3 py-6 border-y border-paper-200">
          {partners.map((m) => (
            <Link
              key={m.slug}
              href={`/manufacturers/${m.slug}`}
              aria-label={m.name}
              title={m.name}
              className="group relative h-24 md:h-28 rounded-xl bg-white border border-paper-200 grid place-items-center p-2 hover:border-green-500 hover:shadow-[0_4px_18px_-8px_rgba(34,197,94,0.4)] transition-all"
            >
              {m.logo ? (
                <Image
                  src={m.logo}
                  alt={m.name}
                  width={200}
                  height={100}
                  sizes="200px"
                  className="max-h-full max-w-full w-auto h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <span className="font-display text-[15px] md:text-[17px] font-bold text-ink-700 group-hover:text-green-700 transition-colors text-center px-2 leading-tight">
                  {m.name}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mt-12">
          {benefits.map((b, i) => (
            <div key={b.title}>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 grid place-items-center mb-4">
                <svg viewBox="0 0 24 24" className="icon w-6 h-6">
                  <path d={BENEFIT_ICONS[i]} />
                </svg>
              </div>
              <div className="text-[17px] font-bold text-ink-900 font-display">{b.title}</div>
              <div className="text-[13px] text-ink-600 leading-relaxed mt-1.5">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
