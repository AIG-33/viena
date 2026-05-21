import { ContactForm } from "@/components/contacts/ContactForm";
import { CartSection } from "@/components/contacts/CartSection";
import { YandexMap } from "@/components/contacts/YandexMap";
import { PageHero } from "@/components/layout/PageHero";
import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacts.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/contacts"),
  };
}

type InfoCardType = "land" | "mobile" | "email" | "telegram";

function ContactIcon({
  type,
  className = "w-6 h-6",
}: {
  type: InfoCardType | "address";
  className?: string;
}) {
  switch (type) {
    case "land":
      return (
        <svg viewBox="0 0 24 24" className={`icon ${className}`} aria-hidden>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.71A2 2 0 0 1 22 16.92z" />
          <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" />
        </svg>
      );
    case "mobile":
      return (
        <svg viewBox="0 0 24 24" className={`icon ${className}`} aria-hidden>
          <rect x="6" y="2" width="12" height="20" rx="2.5" />
          <path d="M11 18h2" />
          <path d="M9 5h6" opacity="0.5" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" className={`icon ${className}`} aria-hidden>
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      );
    case "telegram":
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="currentColor"
          aria-hidden
        >
          <path d="M21.6 4.2 2.9 11.4c-1.3.5-1.3 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.8-.5l2.5-2.5 5.2 3.8c.9.5 1.6.3 1.9-.9l3.4-15.9c.4-1.5-.5-2.2-1.5-1.7zM8.6 14.6 18 8.7c.4-.3.8-.1.5.2L11.7 16l-.3 3.4-2.8-4.8z" />
        </svg>
      );
    case "address":
      return (
        <svg viewBox="0 0 24 24" className={`icon ${className}`} aria-hidden>
          <path d="M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
  }
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contacts");

  const infoCards: Array<{
    label: string;
    value: string;
    href: string;
    type: InfoCardType;
    external?: boolean;
  }> = [
    {
      label: t("info.phoneLand"),
      value: "+375 17 392-02-55",
      href: "tel:+375173920255",
      type: "land",
    },
    {
      label: t("info.telegram"),
      value: "@viena_medical_bot",
      href: "https://t.me/viena_medical_bot",
      type: "telegram",
      external: true,
    },
    {
      label: t("info.phoneMobile"),
      value: "+375 29 392-02-73",
      href: "tel:+375293920273",
      type: "mobile",
    },
    {
      label: t("info.email"),
      value: "med@viena.by",
      href: "mailto:med@viena.by",
      type: "email",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={
          <>
            {t("hero.titleLine1")}{" "}
            <span className="text-grad-green">{t("hero.titleLine1Accent")}</span>
            <br />
            {t("hero.titleLine2Pre")}{" "}
            <span className="text-grad-green">{t("hero.titleLine2Accent")}</span>
          </>
        }
        description={t("hero.description")}
      />

      <section className="bg-white pb-12">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14 grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoCards.map((c, i) => (
                <a
                  key={`${c.label}-${i}`}
                  href={c.href}
                  {...(c.external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="group relative block overflow-hidden rounded-2xl bg-white border border-paper-200 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-400 hover:shadow-[0_18px_42px_-22px_rgba(15,17,19,0.25)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 100% 0%, rgba(34,197,142,0.10) 0%, rgba(255,255,255,0) 60%)",
                    }}
                  />

                  <span
                    aria-hidden
                    className="absolute top-4 right-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper-100 text-ink-400 transition-all duration-200 group-hover:bg-green-500 group-hover:text-white group-hover:shadow-[0_8px_20px_-8px_rgba(34,197,142,0.6)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </span>

                  <div
                    className="relative inline-grid h-12 w-12 place-items-center rounded-xl text-green-700 transition-transform duration-300 group-hover:scale-[1.08] group-hover:-rotate-6"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-green-50) 0%, var(--color-green-100) 100%)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-xl ring-1 ring-inset ring-green-200/80"
                    />
                    <span
                      aria-hidden
                      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(34,197,142,0.45) 0%, rgba(34,197,142,0) 70%)",
                      }}
                    />
                    <ContactIcon type={c.type} className="relative h-6 w-6" />
                  </div>

                  <div className="relative mt-4 text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500">
                    {c.label}
                  </div>
                  <div className="relative mt-1.5 font-display text-[18px] md:text-[19px] font-bold tracking-tight tabular-nums text-ink-900 group-hover:text-green-800 transition-colors">
                    {c.value}
                  </div>
                </a>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-paper-200 p-6 transition-all duration-200 hover:border-green-400 hover:shadow-[0_18px_42px_-22px_rgba(15,17,19,0.22)]">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70"
                style={{
                  background:
                    "radial-gradient(circle, var(--color-green-100) 0%, rgba(34,197,142,0) 70%)",
                }}
              />

              <div className="relative flex items-start gap-4">
                <div
                  className="relative inline-grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-green-700"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-green-50) 0%, var(--color-green-100) 100%)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-green-200/80"
                  />
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-green-500 ring-4 ring-white"
                  />
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"
                  />
                  <ContactIcon type="address" className="relative h-7 w-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500">
                    {t("info.addressHeading")}
                  </div>
                  <div className="font-display text-[17px] md:text-[19px] font-bold leading-snug tracking-tight text-ink-900 mt-1.5">
                    {t("info.addressValue")}
                  </div>
                  <div className="text-[13px] text-ink-600 mt-2 leading-relaxed">
                    {t("info.schedule")}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500">
                {t("info.requisites")}
              </div>
              <div className="text-[14px] text-ink-900 mt-2 leading-relaxed">
                <div className="font-bold">{t("info.company")}</div>
                <div className="text-ink-600">{t("info.unp")}</div>
                <a
                  href="https://shop.viena.by"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-green-700 font-semibold hover:text-green-600"
                >
                  {t("info.shopLink")}
                </a>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="bg-paper-50 py-12 md:py-16">
        <div id="cart" className="scroll-mt-28 max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <CartSection />
        </div>
      </section>

      <YandexMap />
    </>
  );
}
