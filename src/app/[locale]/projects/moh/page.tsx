import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildAlternates } from "@/lib/seo";
import { applyLocaleAll, type Translatable } from "@/lib/i18n-data";
import type { Locale } from "@/i18n/routing";
import lettersDataRaw from "@/../data/moh-letters.json";

interface Letter {
  slug: string;
  date: string;
  year: number;
  outgoing: string;
  title: string;
  addressee: string;
  summary: string;
  tags: string[];
  topics: string[];
  sourceUrl?: string;
  sourceLabel?: string;
}

type LocaledLetter = Letter & Translatable;

const lettersAll = lettersDataRaw as LocaledLetter[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "moh.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/projects/moh"),
  };
}

export default async function MOHTimelinePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("moh");
  const tNav = await getTranslations("nav");

  const letters = applyLocaleAll(lettersAll, locale) as Letter[];
  const groups = groupByYear(letters);
  const years = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a);

  const totalLetters = letters.length;
  const yearsCovered = years[0] - years[years.length - 1];
  const addressees = new Set(
    letters.flatMap((l) =>
      l.addressee
        .split("·")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
  const illustrationItems = t.raw("illustration.items") as string[];

  return (
    <>
      <Breadcrumbs
        items={[
          { name: tNav("home"), href: "/" },
          { name: tNav("projects"), href: "/projects" },
          { name: tNav("mohLong"), href: "/projects/moh" },
        ]}
      />
      <PageHero
        eyebrow={
          <>
            <Link href="/projects" className="hover:text-green-700">
              {tNav("projects")}
            </Link>
            <span className="opacity-50">·</span>
            {t("hero.eyebrowSection")}
          </>
        }
        title={
          <>
            <span className="text-grad-green">{t("hero.titleLine1Accent")}</span> {t("hero.titleLine1")}
            <br />
            {t("hero.titleLine2Pre")} <span className="text-grad-green">{t("hero.titleLine2Accent")}</span>
          </>
        }
        description={t("hero.description")}
        aside={
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t("hero.stats.years")} value={`${yearsCovered}+`} note={t("hero.stats.yearsRange")} />
            <StatCard label={t("hero.stats.letters")} value={String(totalLetters)} note={t("hero.stats.lettersNote")} />
            <StatCard label={t("hero.stats.addressees")} value={String(addressees.size)} note={t("hero.stats.addresseesNote")} />
            <StatCard label={t("hero.stats.topics")} value="6" note={t("hero.stats.topicsNote")} />
          </div>
        }
      />

      {/* Hero illustration band */}
      <section className="relative bg-white border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14 py-8 md:py-10">
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="relative aspect-[21/9] lg:aspect-[28/9] rounded-2xl overflow-hidden bg-paper-100 border border-paper-200">
              <Image
                src="/images/projects/belarus-moh.jpg"
                alt={t("illustration.title")}
                fill
                sizes="(max-width:1024px) 100vw, 70vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-white">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] font-bold opacity-90">
                    {t("illustration.eyebrow")}
                  </div>
                  <div className="font-display text-[20px] md:text-[26px] font-bold leading-tight mt-1">
                    {t("illustration.title")}
                  </div>
                </div>
                <span className="font-mono text-[12px] tabular-nums px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-md border border-white/25">
                  {t("illustration.badge")}
                </span>
              </div>
            </div>
            <div className="text-[13px] text-ink-700 leading-relaxed max-w-sm">
              <p className="font-display text-[15px] font-bold text-ink-900 mb-2">
                {t("illustration.summaryHeading")}
              </p>
              <ul className="space-y-1.5">
                {illustrationItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-paper-50 py-14 md:py-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="mb-10 md:mb-14 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="eyebrow">
                <span className="dot" />
                {t("timeline.eyebrow")}
              </span>
              <h2 className="display-heading text-[28px] md:text-[42px] text-ink-900 mt-3 max-w-2xl">
                {t("timeline.titleLine1")}
                <br />
                <span className="text-ink-500">{t("timeline.titleLine2")}</span>
              </h2>
            </div>
            <div className="font-mono text-[11px] tabular-nums text-ink-500 tracking-[0.1em] uppercase">
              {years[0]} → {years[years.length - 1]}
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute left-[18px] md:left-[78px] top-2 bottom-2 w-px bg-gradient-to-b from-green-200 via-green-300 to-green-100"
            />

            <div className="space-y-12 md:space-y-16">
              {years.map((year) => (
                <YearBlock
                  key={year}
                  year={year}
                  items={groups[year]}
                  lettersLabel={t("timeline.letters", { count: groups[year].length })}
                  topicsLabel={t("timeline.topicsLabel")}
                  addresseePrefix={t("timeline.addresseePrefix")}
                />
              ))}
            </div>

            <div className="relative md:pl-[120px] mt-10 pl-[44px]">
              <div
                aria-hidden
                className="absolute left-[10px] md:left-[70px] -top-1 grid place-items-center"
              >
                <div className="h-4 w-4 rounded-full bg-ink-900 ring-4 ring-paper-50" />
              </div>
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500">
                {t("timeline.origin")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
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
            <Link href="/contacts" className="btn btn-green shrink-0">
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function groupByYear(items: Letter[]): Record<number, Letter[]> {
  return items.reduce<Record<number, Letter[]>>((acc, l) => {
    (acc[l.year] = acc[l.year] || []).push(l);
    return acc;
  }, {});
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="glass-card p-4">
      <div className="font-display text-[28px] md:text-[32px] font-bold leading-none text-ink-900">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.1em] font-bold text-green-700 mt-1.5">
        {label}
      </div>
      {note && (
        <div className="font-mono text-[10px] text-ink-500 tracking-[0.08em] uppercase mt-1">
          {note}
        </div>
      )}
    </div>
  );
}

function YearBlock({
  year,
  items,
  lettersLabel,
  topicsLabel,
  addresseePrefix,
}: {
  year: number;
  items: Letter[];
  lettersLabel: string;
  topicsLabel: string;
  addresseePrefix: string;
}) {
  return (
    <div className="relative">
      <div className="relative pl-[44px] md:pl-[120px] mb-5 md:mb-7">
        <div
          aria-hidden
          className="absolute left-[2px] md:left-[62px] top-1.5 grid place-items-center"
        >
          <div className="h-8 w-8 rounded-full bg-white border border-green-300 grid place-items-center shadow-sm">
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <div
            className="font-display font-extrabold leading-none text-ink-900"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {year}
          </div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500">
            {lettersLabel}
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-5">
        {items.map((letter) => (
          <LetterCard
            key={letter.slug}
            letter={letter}
            topicsLabel={topicsLabel}
            addresseePrefix={addresseePrefix}
          />
        ))}
      </div>
    </div>
  );
}

function LetterCard({
  letter,
  topicsLabel,
  addresseePrefix,
}: {
  letter: Letter;
  topicsLabel: string;
  addresseePrefix: string;
}) {
  return (
    <div className="relative pl-[44px] md:pl-[120px]">
      <div
        aria-hidden
        className="absolute left-[14px] md:left-[74px] top-7 h-2 w-2 rounded-full bg-green-400 ring-4 ring-paper-50"
      />
      <div
        aria-hidden
        className="absolute left-[18px] md:left-[78px] top-8 h-px w-[24px] md:w-[40px] bg-green-200"
      />

      <article className="card p-6 md:p-7 transition-all hover:border-green-300 hover:shadow-[0_12px_30px_-16px_rgba(15,23,42,0.18)]">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center font-mono text-[11px] tabular-nums tracking-[0.08em] px-2.5 py-1 rounded-md bg-ink-900 text-white">
            {letter.date}
          </span>
          <span className="font-mono text-[11px] text-ink-500 tracking-[0.08em] uppercase">
            {letter.outgoing}
          </span>
          <span className="ml-auto font-mono text-[10px] text-ink-400 tracking-[0.1em] uppercase hidden md:inline">
            {letter.slug}
          </span>
        </div>

        <h3 className="font-display text-[20px] md:text-[24px] font-bold text-ink-900 leading-snug">
          {letter.title}
        </h3>

        <div className="mt-2 text-[12px] text-green-700 font-bold tracking-[0.04em] uppercase">
          {addresseePrefix} {letter.addressee}
        </div>

        <p className="text-[14px] md:text-[15px] text-ink-700 leading-relaxed mt-4">
          {letter.summary}
        </p>

        {letter.sourceUrl && (
          <p className="mt-3">
            <a
              href={letter.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-700 underline decoration-green-300 underline-offset-2 hover:text-green-800"
            >
              {letter.sourceLabel ?? letter.sourceUrl}
              <span aria-hidden>↗</span>
            </a>
          </p>
        )}

        {letter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {letter.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-green-100 text-green-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {letter.topics.length > 0 && (
          <details className="group mt-5 border-t border-paper-200 pt-4">
            <summary className="flex items-center justify-between gap-3 list-none cursor-pointer text-[12px] font-bold tracking-[0.1em] uppercase text-ink-700 hover:text-green-700 transition-colors">
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-green-500" />
                {topicsLabel} · {letter.topics.length}
              </span>
              <span className="font-mono text-[11px] text-ink-500 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <ol className="mt-4 space-y-3 list-none counter-reset-[topic]">
              {letter.topics.map((topic, idx) => (
                <li
                  key={idx}
                  className="relative pl-9 text-[14px] text-ink-800 leading-relaxed"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 grid place-items-center h-6 w-6 rounded-full bg-green-50 border border-green-200 font-mono text-[10px] font-bold text-green-700 tabular-nums"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {topic}
                </li>
              ))}
            </ol>
          </details>
        )}
      </article>
    </div>
  );
}
