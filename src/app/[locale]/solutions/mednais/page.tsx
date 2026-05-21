/**
 * MedNAIS™ partner-solution landing page.
 *
 * This route is *not* a catalog SKU — it's a long-form marketing page for
 * the MedNAIS™ digital-SOP platform by Samplify FZCO that VIENA MEDICAL
 * deploys locally. It's reached from the catalog tile (`category.link =
 * "/solutions/mednais"`) and from sitemap.xml.
 *
 * Sections (top → bottom):
 *  1. Hero with KPI stat card aside (re-uses PageHero)
 *  2. Overview — what the platform is + four bullet pillars
 *  3. Ecosystem — four module cards (Hub / Assistant / Monitor / Logger)
 *  4. Applications — six industry scenarios
 *  5. Rollout — three deployment phases + three patterns
 *  6. KPIs — before/after table + analytics-ethics caveat
 *  7. FAQ — emitted to FAQPage JSON-LD as well
 *  8. CTA — book demo / contact expert
 *
 * Copy lives under the `mednais` namespace in `messages/{ru,en,zh}.json`.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildAlternates,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  localePath,
} from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mednais.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/solutions/mednais"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

interface ModuleItem {
  tag: string;
  name: string;
  summary: string;
  features: string[];
}
interface ApplicationItem {
  tag: string;
  title: string;
  body: string;
}
interface RolloutPhase {
  label: string;
  title: string;
  body: string;
}
interface RolloutMode {
  name: string;
  body: string;
}
interface KpiRow {
  k: string;
  before: string;
  after: string;
}
interface FaqItem {
  q: string;
  a: string;
}
interface HeroStat {
  v: string;
  k: string;
  n: string;
}

export default async function MednaisLandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mednais");
  const tNav = await getTranslations("nav");

  const heroStats = t.raw("hero.stats") as Record<string, HeroStat>;
  const overviewBullets = t.raw("overview.bullets") as string[];
  const modules = t.raw("modules.items") as ModuleItem[];
  const applications = t.raw("applications.items") as ApplicationItem[];
  const phases = t.raw("rollout.phases") as RolloutPhase[];
  const modes = t.raw("rollout.modes") as RolloutMode[];
  const kpiRows = t.raw("kpis.rows") as KpiRow[];
  const kpiHeaders = t.raw("kpis.headers") as {
    metric: string;
    before: string;
    after: string;
  };
  const faqItems = t.raw("faq.items") as FaqItem[];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tNav("home"), url: localePath(locale, "/") },
    {
      name: t("breadcrumbs.catalog"),
      url: localePath(locale, "/catalog"),
    },
    {
      name: t("breadcrumbs.product"),
      url: localePath(locale, "/solutions/mednais"),
    },
  ]);
  const faqJsonLd = buildFaqJsonLd(
    faqItems.map((f) => ({ q: f.q, a: f.a }))
  );
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MedNAIS™",
    applicationCategory: "MedicalApplication",
    operatingSystem: "iOS, iPadOS, watchOS, Android, Wear OS, Web",
    description: t("meta.description"),
    url: `https://www.viena.by${localePath(locale, "/solutions/mednais")}`,
    image: `https://www.viena.by/images/categories/mednais.jpg`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    provider: {
      "@type": "Organization",
      name: "Samplify FZCO",
      url: "https://mednais.com",
    },
    isSupportedBy: {
      "@type": "Organization",
      name: "VIENA MEDICAL",
      url: "https://www.viena.by",
    },
  };
  const jsonLdNodes: Record<string, unknown>[] = [
    productJsonLd,
    breadcrumbJsonLd,
  ];
  if (faqJsonLd) jsonLdNodes.push(faqJsonLd);

  return (
    <>
      <JsonLd data={jsonLdNodes} />

      <PageHero
        brandLogo={{
          src: "/images/solutions/mednais-logo.png",
          alt: "MedNAIS™",
          width: 588,
          height: 614,
        }}
        eyebrow={
          <>
            <Link href="/catalog" className="hover:text-green-700">
              {t("breadcrumbs.catalog")}
            </Link>
            <span className="opacity-50">·</span>
            {t("hero.eyebrowSection")}
          </>
        }
        title={
          <>
            <span className="text-grad-green">
              {t("hero.titleLine1Accent")}
            </span>{" "}
            {t("hero.titleLine1")}
            <br />
            {t("hero.titleLine2Pre")}{" "}
            <span className="text-grad-green">
              {t("hero.titleLine2Accent")}
            </span>
          </>
        }
        description={t("hero.description")}
        aside={
          <div className="grid grid-cols-2 gap-3">
            <HeroStatCard data={heroStats.onboarding} />
            <HeroStatCard data={heroStats.errors} />
            <HeroStatCard data={heroStats.throughput} />
            <HeroStatCard data={heroStats.audit} />
            <p className="col-span-2 text-[10.5px] leading-snug text-ink-500 mt-1">
              {t("hero.disclaimer")}
            </p>
          </div>
        }
      />

      {/* Hero CTA strip — sits between hero and content */}
      <section className="bg-white border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <Link href="/contacts" className="btn btn-green">
            {t("hero.primaryCta")}
          </Link>
          <a
            href="https://mednais.com/media"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            {t("hero.secondaryCta")}
          </a>
          <span className="ml-auto font-mono text-[11px] tracking-[0.1em] uppercase text-ink-500 inline-flex items-center gap-2">
            by
            <Link
              href="/manufacturers/samplify"
              aria-label="Samplify FZCO"
              className="inline-flex items-center"
            >
              <Image
                src="/images/manufacturers/samplify.png"
                alt="Samplify FZCO"
                width={1024}
                height={470}
                className="h-4 w-auto object-contain"
              />
            </Link>
            <span className="opacity-50">·</span>
            deployed by VIENA MEDICAL
          </span>
        </div>
      </section>

      {/* Section 2 — Overview */}
      <section className="bg-paper-50 py-14 md:py-20 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-7">
              <span className="eyebrow">
                <span className="dot" />
                {t("overview.eyebrow")}
              </span>
              <h2 className="display-heading text-[28px] md:text-[40px] text-ink-900 mt-3 leading-[1.1]">
                {t("overview.title")}
              </h2>
              <p className="text-[15px] md:text-[16px] text-ink-700 leading-relaxed mt-5">
                {t("overview.lead")}
              </p>
              <p className="text-[14px] md:text-[15px] text-ink-600 leading-relaxed mt-4">
                {t("overview.body")}
              </p>
            </div>
            <ul className="lg:col-span-5 self-start space-y-3 lg:mt-12">
              {overviewBullets.map((b, idx) => (
                <li
                  key={idx}
                  className="card p-4 md:p-5 flex gap-3 items-start"
                >
                  <span
                    aria-hidden
                    className="mt-1 grid place-items-center h-7 w-7 rounded-full bg-green-50 border border-green-200 font-mono text-[11px] font-bold text-green-700 tabular-nums shrink-0"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] md:text-[15px] text-ink-800 leading-snug">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3 — Modules */}
      <section className="bg-white py-14 md:py-20 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <SectionHeader
            eyebrow={t("modules.eyebrow")}
            title={t("modules.title")}
            subtitle={t("modules.subtitle")}
          />
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
            {modules.map((m, idx) => (
              <article
                key={m.name}
                className="card p-6 md:p-7 flex flex-col gap-4 hover:border-green-300 hover:shadow-[0_12px_30px_-16px_rgba(15,23,42,0.18)] transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.12em] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    {m.tag}
                  </span>
                  <span className="font-mono text-[10px] text-ink-400 tracking-[0.12em] tabular-nums">
                    M / {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-[22px] md:text-[26px] text-ink-900 leading-tight">
                  {m.name}
                </h3>
                <p className="text-[14px] md:text-[15px] text-ink-700 leading-relaxed">
                  {m.summary}
                </p>
                <ul className="mt-1 space-y-1.5 text-[13.5px] text-ink-700">
                  {m.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Applications */}
      <section className="bg-paper-50 py-14 md:py-20 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <SectionHeader
            eyebrow={t("applications.eyebrow")}
            title={t("applications.title")}
            subtitle={t("applications.subtitle")}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {applications.map((a, idx) => (
              <article
                key={a.title}
                className="bg-white rounded-2xl border border-paper-200 p-5 md:p-6 flex flex-col gap-3 hover:border-ink-900 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] font-bold text-ink-500">
                    {a.tag}
                  </span>
                  <span className="font-mono text-[10px] text-ink-400 tracking-[0.12em] tabular-nums">
                    A · {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-[17px] md:text-[19px] text-ink-900 leading-snug">
                  {a.title}
                </h3>
                <p className="text-[13.5px] md:text-[14px] text-ink-700 leading-relaxed">
                  {a.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Rollout */}
      <section className="bg-white py-14 md:py-20 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <SectionHeader
            eyebrow={t("rollout.eyebrow")}
            title={t("rollout.title")}
            subtitle={t("rollout.subtitle")}
          />
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {phases.map((p, idx) => (
              <article
                key={p.title}
                className="relative card p-6 md:p-7 flex flex-col gap-3"
              >
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-bold text-green-700">
                  {p.label}
                </span>
                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="font-display text-[40px] md:text-[44px] font-extrabold leading-none text-ink-200 tabular-nums"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[18px] md:text-[20px] text-ink-900 leading-snug">
                    {p.title}
                  </h3>
                </div>
                <p className="text-[14px] text-ink-700 leading-relaxed">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 md:mt-10 grid md:grid-cols-3 gap-3">
            {modes.map((m) => (
              <div
                key={m.name}
                className="rounded-xl border border-paper-200 bg-paper-50 px-4 py-3 flex items-start gap-3"
              >
                <span
                  aria-hidden
                  className="mt-1 h-2 w-2 rounded-full bg-green-500 shrink-0"
                />
                <div>
                  <div className="font-display text-[13px] font-bold text-ink-900">
                    {m.name}
                  </div>
                  <div className="text-[12.5px] text-ink-600 leading-snug">
                    {m.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — KPIs + ethics caveat */}
      <section className="bg-paper-50 py-14 md:py-20 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <SectionHeader
            eyebrow={t("kpis.eyebrow")}
            title={t("kpis.title")}
            subtitle={t("kpis.subtitle")}
          />
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10 items-start">
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-ink-900 text-white">
                    <th className="text-left text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3">
                      {kpiHeaders.metric}
                    </th>
                    <th className="text-left text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3">
                      {kpiHeaders.before}
                    </th>
                    <th className="text-left text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3">
                      {kpiHeaders.after}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kpiRows.map((r, i) => (
                    <tr
                      key={r.k}
                      className={i % 2 === 0 ? "bg-white" : "bg-paper-50"}
                    >
                      <td className="px-4 py-4 text-[14px] text-ink-800">
                        {r.k}
                      </td>
                      <td className="px-4 py-4 font-mono text-[13.5px] text-ink-500 line-through">
                        {r.before}
                      </td>
                      <td className="px-4 py-4 font-mono text-[14px] font-bold text-green-700">
                        {r.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <aside className="card p-6 md:p-7">
              <span className="eyebrow">
                <span className="dot" />
                {t("ethics.eyebrow")}
              </span>
              <h3 className="font-display text-[20px] md:text-[22px] text-ink-900 mt-3 leading-snug">
                {t("ethics.title")}
              </h3>
              <p className="text-[14px] text-ink-700 leading-relaxed mt-3">
                {t("ethics.body")}
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Section 7 — FAQ */}
      <section className="bg-white py-14 md:py-20 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <SectionHeader
            eyebrow={t("faq.eyebrow")}
            title={t("faq.title")}
          />
          <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
            {faqItems.map((f, i) => (
              <details
                key={i}
                className="group bg-white border border-paper-200 rounded-2xl p-5 md:p-6 hover:border-green-300 transition-colors [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-start justify-between gap-3 cursor-pointer list-none">
                  <h3 className="font-display text-ink-900 text-[15px] md:text-[16px] leading-snug">
                    {f.q}
                  </h3>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-45 mt-0.5 text-[18px] leading-none"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] md:text-[15px] leading-relaxed text-ink-700">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 — final CTA */}
      <section className="bg-white py-14 md:py-18">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div
            className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{
              background:
                "linear-gradient(120deg, var(--color-green-100) 0%, var(--color-paper-100) 60%)",
            }}
          >
            <div className="max-w-2xl">
              <span className="eyebrow">
                <span className="pill">{t("cta.eyebrow")}</span>
                {t("cta.eyebrowSub")}
              </span>
              <h3 className="font-display text-[22px] md:text-[30px] font-bold text-ink-900 mt-3 leading-tight">
                {t("cta.title")}
              </h3>
              <p className="text-[14px] md:text-[15px] text-ink-700 mt-3">
                {t("cta.subtitle")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/contacts" className="btn btn-green">
                {t("cta.primary")}
              </Link>
              <a
                href="https://mednais.com/contacts"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                {t("cta.secondary")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 md:mb-14 max-w-3xl">
      <span className="eyebrow">
        <span className="dot" />
        {eyebrow}
      </span>
      <h2 className="display-heading text-[26px] md:text-[36px] text-ink-900 mt-3 leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[14px] md:text-[15px] text-ink-600 leading-relaxed mt-4">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function HeroStatCard({ data }: { data: HeroStat }) {
  return (
    <div className="glass-card p-4">
      <div className="font-display text-[26px] md:text-[30px] font-bold leading-none text-ink-900">
        {data.v}
      </div>
      <div className="text-[11px] uppercase tracking-[0.1em] font-bold text-green-700 mt-1.5">
        {data.k}
      </div>
      <div className="font-mono text-[10px] text-ink-500 tracking-[0.08em] uppercase mt-1">
        {data.n}
      </div>
    </div>
  );
}
