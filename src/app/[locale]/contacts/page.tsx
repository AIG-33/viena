import { ContactForm } from "@/components/contacts/ContactForm";
import { CartSection } from "@/components/contacts/CartSection";
import { YandexMap } from "@/components/contacts/YandexMap";
import { PageHero } from "@/components/layout/PageHero";
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
  };
}

const PHONE_ICON =
  "M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z";
const MAIL_ICON = "M3 6h18v12H3zM3 6l9 7 9-7";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contacts");

  const infoCards = [
    {
      label: t("info.phoneLand"),
      value: "+375 17 392-02-55",
      href: "tel:+375173920255",
      icon: PHONE_ICON,
    },
    {
      label: t("info.phoneLand"),
      value: "+375 17 336-55-02",
      href: "tel:+375173365502",
      icon: PHONE_ICON,
    },
    {
      label: t("info.phoneMobile"),
      value: "+375 29 392-02-73",
      href: "tel:+375293920273",
      icon: PHONE_ICON,
    },
    {
      label: t("info.email"),
      value: "med@viena.by",
      href: "mailto:med@viena.by",
      icon: MAIL_ICON,
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
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {infoCards.map((c, i) => (
                <a
                  key={`${c.label}-${i}`}
                  href={c.href}
                  className="card card-hover p-5 block"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 grid place-items-center">
                    <svg viewBox="0 0 24 24" className="icon w-4 h-4">
                      <path d={c.icon} />
                    </svg>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500 mt-3">
                    {c.label}
                  </div>
                  <div className="mt-1 text-[16px] font-bold text-ink-900">{c.value}</div>
                </a>
              ))}
            </div>

            <div className="card p-6">
              <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 grid place-items-center">
                <svg viewBox="0 0 24 24" className="icon w-4 h-4">
                  <path d="M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
              </div>
              <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500 mt-3">
                {t("info.addressHeading")}
              </div>
              <div className="text-[16px] font-bold text-ink-900 mt-1">
                {t("info.addressValue")}
              </div>
              <div className="text-[13px] text-ink-600 mt-2">
                {t("info.schedule")}
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

      <YandexMap />

      <section className="bg-paper-50 py-12 md:py-16">
        <div id="cart" className="scroll-mt-28 max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <CartSection />
        </div>
      </section>
    </>
  );
}
