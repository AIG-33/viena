import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllServices } from "@/lib/data";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { PageHero } from "@/components/layout/PageHero";
import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/services"),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const services = getAllServices(locale);
  const stats = t.raw("hero.stats") as { k: string; v: string }[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={
          <>
            {t("hero.titleLine1")} <span className="text-grad-green">{t("hero.titleLine1Accent")}</span>
            <br />
            {t("hero.titleLine2")} <span className="text-grad-green">{t("hero.titleLine2Accent")}</span>
          </>
        }
        description={t("hero.description")}
        aside={
          <div className="grid grid-cols-1 gap-3">
            {stats.map((r) => (
              <div
                key={r.k}
                className="glass-card px-5 py-3 flex items-baseline justify-between"
              >
                <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500">
                  {r.k}
                </span>
                <span className="text-[13px] font-semibold text-ink-900">
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        }
      />

      <section className="bg-paper-50 py-16 md:py-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <ProcessTimeline />
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <h2 className="display-heading text-ink-900 text-3xl md:text-4xl max-w-2xl">
              {t("list.titlePre")} <span className="text-green-600">{t("list.titleAccent")}</span>
            </h2>
            <span className="text-[12px] text-ink-500">{t("list.subtitle")}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div
            className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{
              background:
                "linear-gradient(120deg, var(--color-green-100) 0%, var(--color-paper-100) 60%)",
            }}
          >
            <div className="max-w-xl">
              <span className="eyebrow">
                <span className="pill">{t("cta.eyebrow")}</span>
                {t("cta.eyebrowText")}
              </span>
              <h3 className="display-heading text-ink-900 text-3xl md:text-4xl mt-3">
                {t("cta.titlePre")} <span className="text-green-600">{t("cta.titleAccent")}</span>
              </h3>
              <p className="text-[15px] text-ink-700 mt-3">
                {t("cta.subtitle")}
              </p>
            </div>
            <Link href="/contacts" className="btn btn-green btn-lg shrink-0">
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
