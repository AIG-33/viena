import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.hero" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const isRu = locale === "ru";
  return {
    title: isRu
      ? "О компании ВИЕНА МЕДИКАЛ — преаналитика и стандарты ISO"
      : tNav("about"),
    description: isRu
      ? "ВИЕНА МЕДИКАЛ с 2016 года: B2B-дистрибьютор лабораторного и медицинского оборудования в Беларуси. Специализация — преаналитика и стандарты ISO 6710, ISO 11137, Директива 98/79/EC. Прямые контракты с Greiner Bio-One, АмплиСенс, Microlit, Tianlong и др."
      : t("description"),
    keywords: isRu
      ? [
          "ВИЕНА МЕДИКАЛ",
          "о компании",
          "преаналитика Беларусь",
          "ISO 6710 Беларусь",
          "дистрибьютор Greiner Bio-One",
          "официальный поставщик VACUETTE",
          "лабораторная диагностика Минск",
          "B2B медоборудование",
        ]
      : undefined,
    alternates: buildAlternates(locale, "/about"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tNav = await getTranslations("nav");

  const principleKeys = ["directContracts", "noSubstitution", "openMarket", "dialog"] as const;
  const credentialKeys = [
    "eflm",
    "iso",
    "publication",
    "patent",
    "rome",
    "vietnam",
  ] as const;
  const preanalyticsStandards = ["iso6710", "iso11137", "directive", "clsi", "who", "moh1123"] as const;

  // Mini-timeline blocks shown next to the MoH CTA (year + topic + hint live in messages later if needed)
  const timelineRows = [
    { year: "2016", topicKey: "topic2016", hintKey: "hint2016" },
    { year: "2017", topicKey: "topic2017", hintKey: "hint2017" },
    { year: "2018", topicKey: "topic2018", hintKey: "hint2018" },
    { year: "2021", topicKey: "topic2021", hintKey: "hint2021" },
    { year: "2023", topicKey: "topic2023", hintKey: "hint2023" },
    { year: "2025", topicKey: "topic2025", hintKey: "hint2025" },
    { year: "2026", topicKey: "topic2026a", hintKey: "hint2026a" },
    { year: "2026", topicKey: "topic2026b", hintKey: "hint2026b" },
  ] as const;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: tNav("home"), href: "/" },
          { name: tNav("about"), href: "/about" },
        ]}
      />
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={
          <>
            {t("hero.titleLine1Pre")}{" "}
            <span className="text-grad-green">{t("hero.titleLine1Accent")}</span>
            {t("hero.titleLine1Post")}
            <br />
            {t("hero.titleLine2Pre")}{" "}
            <span className="text-grad-green">{t("hero.titleLine2Accent")}</span>
          </>
        }
        description={t("hero.description")}
        aside={
          <div className="grid grid-cols-2 gap-3">
            <StatCard value="2016" label={t("hero.stats.year")} note={t("hero.stats.yearNote")} />
            <StatCard value="30+" label={t("hero.stats.manufacturers")} note={t("hero.stats.manufacturersNote")} />
            <StatCard value="500+" label={t("hero.stats.deliveries")} note={t("hero.stats.deliveriesNote")} />
            <StatCard value="11" label={t("hero.stats.letters")} note={t("hero.stats.lettersNote")} />
          </div>
        }
      />

      {/* Manifesto */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 lg:px-14">
          <span className="eyebrow">
            <span className="dot" />
            {t("manifesto.eyebrow")}
          </span>
          <h2 className="display-heading text-[28px] md:text-[44px] text-ink-900 mt-4 leading-[1.05]">
            {t("manifesto.title")}{" "}
            <span className="serif-accent text-green-700">{t("manifesto.titleAccent")}</span>.
          </h2>

          <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
            <div className="space-y-5 text-[15px] md:text-[16px] leading-relaxed text-ink-700">
              <p>{t("manifesto.p1")}</p>
              <p>{t("manifesto.p2")}</p>
              <p>{t("manifesto.p3")}</p>
              <blockquote className="pl-5 border-l-2 border-green-500 italic text-ink-900 text-[16px] md:text-[18px] leading-relaxed">
                {t("manifesto.quote")}
              </blockquote>
            </div>

            <aside className="space-y-3">
              {principleKeys.map((k) => (
                <PrincipleRow
                  key={k}
                  title={t(`principles.${k}.title`)}
                  text={t(`principles.${k}.text`)}
                />
              ))}
            </aside>
          </div>
        </div>
      </section>

      {/* Preanalytics — core specialisation */}
      <section className="bg-white py-14 md:py-20 border-t border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-start">
            <div>
              <span className="eyebrow">
                <span className="pill pill-green">{t("preanalytics.eyebrow")}</span>
                {t("preanalytics.eyebrowSub")}
              </span>
              <h2 className="display-heading text-[28px] md:text-[44px] text-ink-900 mt-4 leading-[1.05]">
                {t("preanalytics.title")}{" "}
                <span className="serif-accent text-green-700">
                  {t("preanalytics.titleAccent")}
                </span>
              </h2>
              <div className="mt-6 space-y-5 text-[15px] md:text-[16px] leading-relaxed text-ink-700 max-w-2xl">
                <p>{t("preanalytics.p1")}</p>
                <p>{t("preanalytics.p2")}</p>
                <blockquote className="pl-5 border-l-2 border-green-500 italic text-ink-900 text-[15px] md:text-[17px] leading-relaxed">
                  {t("preanalytics.quote")}
                </blockquote>
                <p>{t("preanalytics.p3")}</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/projects/moh" className="btn btn-green">
                  {t("preanalytics.ctaPrimary")}
                </Link>
                <Link href="/catalog/vacuum-systems" className="btn btn-ghost">
                  {t("preanalytics.ctaSecondary")}
                </Link>
              </div>
            </div>

            <aside className="grid grid-cols-2 gap-3">
              {preanalyticsStandards.map((k) => (
                <div
                  key={k}
                  className="rounded-2xl border border-paper-200 bg-paper-50 p-4 hover:border-green-300 hover:bg-white transition-colors"
                >
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase font-bold text-green-700">
                    {t(`preanalytics.standards.${k}.eyebrow`)}
                  </div>
                  <div className="font-display text-[14px] font-bold text-ink-900 mt-1.5 leading-snug">
                    {t(`preanalytics.standards.${k}.title`)}
                  </div>
                  <p className="text-[12px] text-ink-600 leading-relaxed mt-1.5">
                    {t(`preanalytics.standards.${k}.note`)}
                  </p>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      {/* Open position — link to MOH */}
      <section className="bg-paper-50 py-14 md:py-20 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-32 -right-24 h-[360px] w-[360px] rounded-full bg-green-200/50 blur-[80px] pointer-events-none"
        />
        <div className="relative max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <span className="eyebrow">
                <span className="pill pill-green">{t("moh.eyebrow")}</span>
                {t("moh.eyebrowSub")}
              </span>
              <h2 className="display-heading text-[28px] md:text-[42px] text-ink-900 mt-4 leading-[1.05]">
                {t("moh.title")}
                <br />
                <span className="serif-accent text-green-700">{t("moh.titleAccent")}</span>
              </h2>
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-700 max-w-xl">
                <p>{t("moh.p1")}</p>
                <p>{t("moh.p2")}</p>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/projects/moh" className="btn btn-green">
                  {t("moh.ctaPrimary")}
                </Link>
                <Link href="/projects" className="btn btn-ghost">
                  {t("moh.ctaSecondary")}
                </Link>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timelineRows.map((it, i) => (
                <li
                  key={`${it.year}-${i}`}
                  className="card p-4 hover:border-green-300 transition-colors"
                >
                  <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-green-700 font-bold">
                    {it.year}
                  </div>
                  <div className="font-display text-[15px] font-bold text-ink-900 mt-1">
                    {t(`timeline.${it.topicKey}`)}
                  </div>
                  <div className="text-[12px] text-ink-600 mt-1">
                    {t(`timeline.${it.hintKey}`)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 items-start">
            <div className="lg:sticky lg:top-28 max-w-[280px] mx-auto lg:mx-0">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-paper-200 bg-paper-100 shadow-[0_18px_42px_-22px_rgba(15,17,19,0.35)]">
                <Image
                  src="/images/about/founder-harbatsevich.jpg"
                  alt={t("founder.name").replace(/\n/g, " ")}
                  fill
                  sizes="(max-width:1024px) 280px, 320px"
                  className="object-cover"
                  priority
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent"
                />
                <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-sm border border-white/80 text-[10px] tracking-[0.16em] uppercase font-bold text-ink-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    EFLM · ISO TC 212
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-display text-[18px] font-bold text-ink-900 leading-tight whitespace-pre-line">
                  {t("founder.name")}
                </div>
                <div className="text-[12px] text-ink-600 mt-1.5">
                  {t("founder.role")}
                </div>
              </div>
            </div>

            <div className="max-w-[760px]">
              <span className="eyebrow">
                <span className="dot" />
                {t("founder.eyebrow")}
              </span>
              <h2 className="display-heading text-[28px] md:text-[42px] text-ink-900 mt-4 leading-[1.05]">
                {t("founder.title1")}
                <br />
                <span className="serif-accent text-green-700">
                  {t("founder.titleAccent")}
                </span>{" "}
                {t("founder.title2")}
              </h2>

              <div className="mt-7 space-y-5 text-[15px] md:text-[16px] leading-relaxed text-ink-700">
                <p>{t("founder.p1")}</p>
                <p>{t("founder.p2")}</p>

                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {credentialKeys.map((k) => (
                    <CredentialCard
                      key={k}
                      eyebrow={t(`founder.credentials.${k}.eyebrow`)}
                      title={t(`founder.credentials.${k}.title`)}
                      note={t(`founder.credentials.${k}.note`)}
                    />
                  ))}
                </div>

                <p>{t("founder.p3")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-paper-50 py-14 md:py-18">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div
            className="rounded-3xl p-8 md:p-12 grid md:grid-cols-[1fr_auto] items-center gap-6"
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

      {locale === "ru" && (
        <section className="bg-white border-t border-paper-200 py-14 md:py-20">
          <div className="max-w-[1100px] mx-auto px-4 md:px-10 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              <div className="lg:col-span-7 space-y-5 text-[15px] md:text-[16px] leading-relaxed text-ink-700">
                <span className="eyebrow">
                  <span className="dot" />
                  Что мы делаем
                </span>
                <h2 className="display-heading text-ink-900 text-2xl md:text-3xl mt-3">
                  Преаналитика как специализация
                </h2>
                <p>
                  ВИЕНА МЕДИКАЛ — белорусский B2B-дистрибьютор лабораторного и
                  медицинского оборудования с 2016 года. Наша основная
                  специализация — преаналитический этап лабораторной
                  диагностики. По данным CLSI и WHO, до 70 % всех ошибок
                  лабораторных исследований возникают именно на этом этапе:
                  при выборе пробирки, технике флеботомии, маркировке,
                  транспортировке.
                </p>
                <p>
                  Мы работаем напрямую с мировыми производителями:{" "}
                  <Link
                    href="/manufacturers/greiner-bio-one"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    Greiner Bio-One
                  </Link>{" "}
                  (вакуумные системы VACUETTE® и MiniCollect®, визуализаторы
                  вен VeinViewer®),{" "}
                  <Link
                    href="/manufacturers/amplisens"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    АмплиСенс
                  </Link>{" "}
                  (тест-системы ПЦР для клинической диагностики),{" "}
                  <Link
                    href="/manufacturers/microlit"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    Microlit
                  </Link>{" "}
                  (механические и электронные дозаторы),{" "}
                  <Link
                    href="/manufacturers/tianlong"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    Tianlong
                  </Link>{" "}
                  (ПЦР-амплификаторы Gentier),{" "}
                  <Link
                    href="/manufacturers/biovitrum"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    BioVitrum
                  </Link>{" "}
                  (реагенты для гистологии и патоморфологии). Это исключает
                  параллельный импорт, контрафакт и подмену сертифицированной
                  продукции «аналогами».
                </p>
                <p>
                  Принципиальная позиция компании — работать только по
                  международным стандартам качества:{" "}
                  <a
                    href="https://www.iso.org/standard/69466.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    ISO 6710
                  </a>{" "}
                  (вакуумные системы взятия крови),{" "}
                  <a
                    href="https://www.iso.org/standard/33952.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    ISO 11137
                  </a>{" "}
                  (финишная гамма-стерилизация),{" "}
                  <a
                    href="https://www.iso.org/standard/59752.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    ISO 13485
                  </a>{" "}
                  (системы менеджмента качества для производителей мед.
                  изделий),{" "}
                  <a
                    href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:31998L0079"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    Директива 98/79/EC
                  </a>{" "}
                  ЕС (диагностика in vitro), руководства{" "}
                  <a
                    href="https://clsi.org/standards/products/general-laboratory/documents/gp41/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    CLSI GP41 / H03
                  </a>
                  ,{" "}
                  <a
                    href="https://www.who.int/publications/i/item/9789241599221"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    WHO Best Practices in Phlebotomy
                  </a>
                  . Внутри РБ — Приказ Минздрава №1123 как минимальная планка.
                </p>
                <p>
                  Мы системно работаем с Минздравом РБ над тем, чтобы эти
                  стандарты применялись в Беларуси по существу, а не
                  формально — наша{" "}
                  <Link
                    href="/projects/moh"
                    className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700"
                  >
                    хронология обращений в МЗ РБ с 2016 года
                  </Link>{" "}
                  показывает, как менялись закупочные требования и какие
                  системные дефекты китайских вакуумных пробирок были
                  зафиксированы документально.
                </p>
              </div>

              <div className="lg:col-span-5 space-y-5">
                <span className="eyebrow">
                  <span className="dot" />
                  Что почитать
                </span>
                <h2 className="display-heading text-ink-900 text-2xl md:text-3xl mt-3">
                  Экспертные материалы
                </h2>
                <p className="text-[14px] text-ink-600 leading-relaxed">
                  Если вы только знакомитесь с темой преаналитики или хотите
                  привести свою КДЛ к международным стандартам — начните с
                  этих статей в нашем блоге:
                </p>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/blog/kak-vybrat-vakuumnye-probirki-iso-6710"
                      className="block group bg-paper-50 border border-paper-200 rounded-lg p-4 hover:border-green-400 transition-colors"
                    >
                      <span className="font-display text-ink-900 group-hover:text-green-700 transition-colors">
                        Гид по ISO 6710 →
                      </span>
                      <p className="text-[13px] text-ink-600 mt-1">
                        Как читать стандарт и составлять корректное тендерное
                        ТЗ.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog/preanalitika-7-oshibok-iskazhayushih-rezultaty"
                      className="block group bg-paper-50 border border-paper-200 rounded-lg p-4 hover:border-green-400 transition-colors"
                    >
                      <span className="font-display text-ink-900 group-hover:text-green-700 transition-colors">
                        7 ошибок преаналитики →
                      </span>
                      <p className="text-[13px] text-ink-600 mt-1">
                        Чек-лист со ссылками на CLSI GP41 и WHO Phlebotomy.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog/vacuette-vs-kitayskie-analogi-vhodnoy-control"
                      className="block group bg-paper-50 border border-paper-200 rounded-lg p-4 hover:border-green-400 transition-colors"
                    >
                      <span className="font-display text-ink-900 group-hover:text-green-700 transition-colors">
                        Входной контроль партии →
                      </span>
                      <p className="text-[13px] text-ink-600 mt-1">
                        VACUETTE® vs китайские аналоги: что проверять при
                        приёмке.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-600 mt-2"
                    >
                      Все статьи блога →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function StatCard({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
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

function PrincipleRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="card p-4 hover:border-green-300 transition-colors">
      <div className="flex items-baseline gap-2">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
        <div className="font-display text-[15px] font-bold text-ink-900">
          {title}
        </div>
      </div>
      <p className="text-[13px] text-ink-700 leading-relaxed mt-1.5 pl-3.5">
        {text}
      </p>
    </div>
  );
}

function CredentialCard({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-paper-200 bg-paper-50 p-4 hover:border-green-300 hover:bg-white transition-colors">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase font-bold text-green-700">
        {eyebrow}
      </div>
      <div className="font-display text-[14px] font-bold text-ink-900 mt-1.5 leading-snug">
        {title}
      </div>
      <p className="text-[12px] text-ink-600 leading-relaxed mt-1.5">{note}</p>
    </div>
  );
}
