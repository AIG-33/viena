import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SocialIcons, type SocialLink } from "./SocialIcons";

const SOCIAL: SocialLink[] = [
  { network: "telegram", url: "https://t.me/viena_medical_bot" },
  { network: "instagram", url: "https://www.instagram.com/vienamedical/" },
  { network: "facebook", url: "https://www.facebook.com/vienamedical" },
  { network: "linkedin", url: "https://www.linkedin.com/company/viena-medical" },
];

export async function Footer() {
  const t = await getTranslations("footer");
  const tMeta = await getTranslations("meta");
  const tCommon = await getTranslations("common");

  return (
    <footer className="relative bg-paper-100 text-ink-700 border-t border-paper-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 pt-14 pb-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          {/* Logo + about */}
          <div>
            <Link href="/" aria-label={tMeta("brand")} className="inline-flex">
              <Image
                src="/images/logo-dark.png"
                alt={tMeta("brand")}
                width={748}
                height={285}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-[13px] leading-relaxed mt-4 max-w-xs text-ink-600">
              {t("tagline")}
            </p>
            <SocialIcons links={SOCIAL} className="mt-5" />
          </div>

          {/* Sections */}
          <div>
            <div className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink-500 mb-4">
              {t("catalogHeading")}
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700 hover:text-green-600"
                >
                  {t("fullCatalog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/manufacturers"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700 hover:text-green-600"
                >
                  {t("manufacturersLink")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700 hover:text-green-600"
                >
                  {t("servicesLink")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700 hover:text-green-600"
                >
                  {t("aboutLink")}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects/moh"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700 hover:text-green-600"
                >
                  {t("mohLink")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700 hover:text-green-600"
                >
                  {t("blogLink")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700 hover:text-green-600"
                >
                  {t("faqLink")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <div className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink-500 mb-4">
              {t("contactsHeading")}
            </div>
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <a href="tel:+375173920255" className="hover:text-green-700">
                  {tCommon("phoneOffice")}
                </a>
              </li>
              <li>
                <a href="tel:+375293920273" className="hover:text-green-700">
                  {tCommon("phone")}
                </a>
              </li>
              <li>
                <a href={`mailto:${tCommon("email")}`} className="hover:text-green-700">
                  {tCommon("email")}
                </a>
              </li>
              <li className="pt-2 text-ink-600 leading-relaxed whitespace-pre-line">
                {tCommon("address")}
              </li>
            </ul>
          </div>

          {/* Requisites */}
          <div>
            <div className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink-500 mb-4">
              {t("requisitesHeading")}
            </div>
            <ul className="space-y-1.5 text-[13px]">
              <li className="font-medium text-ink-900">{t("company")}</li>
              <li className="text-ink-600">{t("unp")}</li>
              <li className="pt-2">
                <a
                  href="https://shop.viena.by"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-green-700 font-semibold hover:text-green-600"
                >
                  {t("shopLink")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-paper-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[12px] text-ink-500">
          <span>{t("rights", { year: new Date().getFullYear() })}</span>
          <span>{t("privacy")}</span>
        </div>
      </div>
    </footer>
  );
}
