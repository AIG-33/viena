import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono, PT_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics, AnalyticsNoScript } from "@/components/analytics/Analytics";
import { CartProvider } from "@/context/CartContext";
import { routing, type Locale } from "@/i18n/routing";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ptSerif = PT_Serif({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://viena.by";

const HTML_LANG: Record<Locale, string> = {
  ru: "ru-BY",
  en: "en",
  zh: "zh-CN",
};

const OG_LOCALE: Record<Locale, string> = {
  ru: "ru_BY",
  en: "en_US",
  zh: "zh_CN",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("siteTitle");
  const description = t("siteDescription");

  // Build hreflang map for SEO.
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[HTML_LANG[l]] = `${SITE_URL}/${l}`;
  }

  const verification: Metadata["verification"] = {};
  if (process.env.NEXT_PUBLIC_YANDEX_VERIFICATION) {
    verification.yandex = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;
  }
  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }
  if (process.env.NEXT_PUBLIC_BING_VERIFICATION) {
    // Next.js renders `verification.other.<name>` as <meta name="<name>">.
    // Bing Webmaster expects `<meta name="msvalidate.01" content="…">`.
    verification.other = {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION,
    };
  }
  const hasVerification =
    !!verification.yandex ||
    !!verification.google ||
    !!verification.other;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${t("brand")}`,
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale as Locale],
      siteName: t("brand"),
      url: `${SITE_URL}/${locale}`,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: t("brand"),
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    verification: hasVerification ? verification : undefined,
    category: "medical",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: t("brand"),
    alternateName: ["VIENA MEDICAL", "ВИЕНА МЕДИКАЛ"],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-dark.png`,
    image: `${SITE_URL}/images/logo-dark.png`,
    description: t("siteDescription"),
    foundingDate: "2016",
    address: {
      "@type": "PostalAddress",
      addressLocality: t("city"),
      addressCountry: "BY",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+375-29-392-02-73",
        contactType: "sales",
        areaServed: "BY",
        availableLanguage: ["ru", "en", "zh"],
        email: "med@viena.by",
      },
    ],
    sameAs: [SITE_URL],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: t("brand"),
    inLanguage: HTML_LANG[locale as Locale],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <html
      lang={HTML_LANG[locale as Locale]}
      className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} ${ptSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <AnalyticsNoScript />
        <NextIntlClientProvider>
          <CartProvider>
            <a href="#main-content" className="skip-nav">
              {t("skipToContent")}
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
