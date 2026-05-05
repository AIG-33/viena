import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  localePath,
} from "@/lib/seo";
import faqData from "../../../../data/faq.json";
import type { Locale } from "@/i18n/routing";

interface FaqGroup {
  id: string;
  title: string;
  items: { q: string; a: string }[];
}

const faqGroups = faqData as FaqGroup[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === "ru";
  return {
    title: isRu
      ? "FAQ — частые вопросы о поставках, тендерах, сервисе"
      : "FAQ — supplies, tenders, service",
    description: isRu
      ? "Ответы на вопросы B2B-клиентов: сроки поставки, документы Минздрава РБ, тендеры, сервис, гарантия, преаналитика и стандарты ISO 6710 / 11137 / Директива 98/79/EC."
      : "Answers for B2B clients: delivery, regulatory documents, tenders, service, warranty, preanalytics and ISO 6710 / 11137 / Directive 98/79/EC.",
    keywords: isRu
      ? [
          "FAQ ВИЕНА МЕДИКАЛ",
          "поставка лабораторного оборудования вопросы",
          "вакуумные пробирки тендер",
          "ISO 6710 преаналитика",
          "сервис лабораторного оборудования Беларусь",
          "регистрационное удостоверение Минздрав РБ",
        ]
      : undefined,
    alternates: { canonical: localePath(locale, "/faq") },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");

  // Flatten all Q&A into a single FAQPage JSON-LD — Google reads only the
  // first ≈10 entries reliably, but emitting all of them helps AI assistants
  // (ChatGPT/Perplexity) cite specific answers.
  const flatFaqs = faqGroups.flatMap((g) => g.items);
  const faqJsonLd = buildFaqJsonLd(flatFaqs);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tNav("home"), url: localePath(locale, "/") },
    { name: "FAQ", url: localePath(locale, "/faq") },
  ]);

  const jsonLdNodes: Record<string, unknown>[] = [breadcrumbJsonLd];
  if (faqJsonLd) jsonLdNodes.push(faqJsonLd);

  return (
    <>
      <JsonLd data={jsonLdNodes} />

      <section className="bg-paper-100 pt-10 md:pt-16 pb-10 md:pb-14 border-b border-paper-200">
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 lg:px-14">
          <nav className="flex items-center gap-2 text-[12px] text-ink-500 mb-6">
            <Link href="/" className="hover:text-green-700 transition-colors">
              {tNav("home")}
            </Link>
            <span>/</span>
            <span className="text-ink-900 font-medium">FAQ</span>
          </nav>

          <span className="eyebrow">
            <span className="dot" />
            {locale === "ru"
              ? `${flatFaqs.length} вопроса · ${faqGroups.length} раздела`
              : `${flatFaqs.length} questions · ${faqGroups.length} sections`}
          </span>
          <h1 className="display-heading text-ink-900 text-4xl md:text-5xl lg:text-6xl mt-4">
            {locale === "ru"
              ? "Частые вопросы"
              : locale === "en"
                ? "Frequently asked questions"
                : "常见问题"}
          </h1>
          <p className="text-[15px] md:text-[16px] text-ink-600 max-w-2xl mt-3 leading-relaxed">
            {locale === "ru"
              ? "Что чаще всего спрашивают B2B-клиенты — клиники, лаборатории, ветврачи, тендерные специалисты. Если вашего вопроса нет — напишите нам, мы ответим в течение рабочего дня и добавим его сюда."
              : locale === "en"
                ? "What B2B clients — clinics, labs, vets, tender specialists — most often ask. If your question is missing, write to us — we will reply within a business day and add it here."
                : "B2B 客户最常问的问题。如果您没找到您的问题,请联系我们 — 我们将在一个工作日内回复并补充于此。"}
          </p>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 lg:px-14">
          {/* Quick anchor nav. */}
          <div className="flex flex-wrap gap-2 mb-12">
            {faqGroups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="pill hover:bg-green-100 hover:text-green-900 transition-colors"
              >
                {g.title}
              </a>
            ))}
          </div>

          <div className="space-y-14">
            {faqGroups.map((group) => (
              <div
                key={group.id}
                id={group.id}
                className="scroll-mt-24"
              >
                <h2 className="display-heading text-ink-900 text-2xl md:text-3xl mb-5 border-b border-paper-200 pb-3">
                  {group.title}
                </h2>
                <div className="space-y-3">
                  {group.items.map((item, idx) => (
                    <details
                      key={idx}
                      className="group bg-paper-50 border border-paper-200 rounded-lg p-5 [&_summary::-webkit-details-marker]:hidden hover:border-paper-300 transition-colors"
                    >
                      <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                        <h3 className="font-display text-ink-900 text-[16px] md:text-[17px] leading-snug">
                          {item.q}
                        </h3>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-45 mt-0.5 text-xl"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-[15px] leading-relaxed text-ink-700 whitespace-pre-line">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-paper-50 border border-paper-200 rounded-xl p-8 md:p-10 text-center">
            <h2 className="display-heading text-ink-900 text-2xl md:text-[28px] mb-3">
              {locale === "ru"
                ? "Не нашли ответа?"
                : locale === "en"
                  ? "Didn't find your answer?"
                  : "没找到答案?"}
            </h2>
            <p className="text-[15px] text-ink-600 mb-5 max-w-xl mx-auto">
              {locale === "ru"
                ? "Напишите нам — обсудим вашу задачу, подберём решение, поможем с тендерным ТЗ или подготовкой документов."
                : locale === "en"
                  ? "Write to us — we will discuss your task, suggest a solution, help with tender requirements or documents."
                  : "请联系我们 — 我们将讨论您的需求,提出方案,协助招标技术规范与文档。"}
            </p>
            <Link href="/contacts" className="btn btn-primary">
              {tNav("contacts")} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
