"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/types/category";
import { getCategoryLink } from "@/lib/utils";

const ICONS: Record<string, string> = {
  package: "M8 2h8v15a4 4 0 0 1-8 0V2zM8 9h8",
  droplet: "M12 3s6 6 6 11a6 6 0 1 1-12 0c0-5 6-11 6-11z",
  cpu: "M9 2h6v8H9zM7 10h10l1 6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4l1-6zM12 14v4",
  flask: "M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19l-6-10V3",
  microscope: "M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  heart: "M5 9a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM15 9a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM9 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM6 15c0-2 2-3 6-3s6 1 6 3-2 5-6 5-6-3-6-5z",
  beaker: "M7 3c5 3 5 15 10 18M17 3c-5 3-5 15-10 18M8 7h8M8 12h8M8 17h8",
  syringe: "M4 12a6 6 0 0 1 12 0 6 6 0 0 1-12 0zM10 8l4 8",
};

interface Props {
  categories: Category[];
}

export function HeroSection({ categories }: Props) {
  const t = useTranslations("home.hero");
  const tCommon = useTranslations("common");
  const tCat = useTranslations("home.categoriesTeaser");
  const tHeroCat = useTranslations("home.hero.categoryCard");
  const locale = useLocale();
  const totalSku = categories.reduce((s, c) => s + (c.productCount || 0), 0);
  const fmt = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale === "zh" ? "zh-CN" : "en-US");

  return (
    <section className="relative overflow-hidden bg-paper-50">
      <div aria-hidden className="absolute inset-0 z-0">
        <Image
          src="/images/categories/equipment.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.55) 50%, rgba(34,197,142,0.18) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 pt-10 md:pt-14 pb-14 md:pb-20 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">
            <span className="dot" /> {t("eyebrow")} · {fmt.format(totalSku)} SKU
          </span>
          <h1 className="display-heading-xl mt-5 text-ink-900">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}{" "}
            <span className="text-green-600">{t("titleLine2Accent")}</span>
            {t("titleLine2End")}
            <br />
            {t("titleLine3")}{" "}
            <span className="text-green-600">{t("titleLine3Accent")}</span>
          </h1>
          <p className="text-[15px] md:text-base leading-relaxed text-ink-700 max-w-xl mt-5">
            {t("subtitle")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/catalog" className="btn btn-green btn-lg">
              {t("ctaSecondary")}
              <span aria-hidden>→</span>
            </Link>
            <Link href="/contacts" className="btn btn-ghost btn-lg">
              {t("ctaPrimary")}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative rounded-3xl border border-white/80 p-5 md:p-6"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-green-700">
              {tCat("title")}
            </span>
            <Link href="/catalog" className="text-[12px] font-semibold text-ink-700 hover:text-green-700">
              {tCommon("all")} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat, i) => {
              const link = getCategoryLink(cat.id);
              const tileClass =
                "flex items-center gap-2.5 px-3 py-3 bg-white rounded-xl border transition-all group " +
                (link.isExternal
                  ? "border-green-200 ring-1 ring-green-100 hover:border-green-500 hover:shadow-[var(--shadow-1)]"
                  : "border-paper-200 hover:border-green-500 hover:shadow-[var(--shadow-1)]");
              const tileBody = (
                <>
                  <span
                    className={
                      "w-8 h-8 rounded-lg grid place-items-center shrink-0 " +
                      (link.isExternal
                        ? "bg-green-500 text-white"
                        : "bg-green-50 text-green-700")
                    }
                  >
                    <svg viewBox="0 0 24 24" className="icon w-4 h-4">
                      <path d={ICONS[cat.icon] || ICONS.flask} />
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="block text-[13px] font-semibold text-ink-900 truncate">
                        {cat.name}
                      </span>
                      {link.isExternal && (
                        <span className="inline-flex items-center px-1.5 py-[1px] rounded-full bg-green-100 text-green-700 text-[9px] font-bold tracking-wide uppercase leading-none">
                          {tCat("externalBadge")}
                        </span>
                      )}
                    </span>
                    <span className="block text-[10px] text-ink-500 mt-0.5">
                      {link.isExternal
                        ? "shop.viena.by"
                        : tHeroCat("itemCount", { count: cat.productCount ?? 0 })}
                    </span>
                  </span>
                  <span
                    className="text-green-600 text-[15px] group-hover:translate-x-0.5 transition-transform"
                    aria-hidden
                  >
                    {link.isExternal ? "↗" : "→"}
                  </span>
                </>
              );
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                >
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={tileClass}
                    >
                      {tileBody}
                    </a>
                  ) : (
                    <Link href={link.href} className={tileClass}>
                      {tileBody}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
          <Link href="/catalog" className="btn btn-green w-full mt-4">
            {tCat("viewAll")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
