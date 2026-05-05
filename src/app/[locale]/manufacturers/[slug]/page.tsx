import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getAllCategories,
  getAllManufacturers,
  getManufacturerBySlug,
  getProductsByManufacturer,
} from "@/lib/data";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ManufacturerWordmark } from "@/components/manufacturers/ManufacturerWordmark";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildManufacturerJsonLd,
  localePath,
} from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { getManufacturerCatalogLink, isShopManufacturer } from "@/lib/utils";

interface ManufacturerPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams() {
  const result: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const m of getAllManufacturers()) {
      result.push({ locale, slug: m.slug });
    }
  }
  return result;
}

export async function generateMetadata({
  params,
}: ManufacturerPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const m = getManufacturerBySlug(slug, locale);
  if (!m) return {};
  return {
    title: m.name,
    description: m.shortDescription,
  };
}

export default async function ManufacturerDetailPage({
  params,
}: ManufacturerPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("manufacturersPage");

  const manufacturer = getManufacturerBySlug(slug, locale);
  if (!manufacturer) notFound();

  const products = getProductsByManufacturer(slug, locale);
  const allCategories = getAllCategories(locale);
  const presentCategories = allCategories.filter((c) =>
    products.some((p) => p.categoryId === c.id)
  );
  const catalogLink = getManufacturerCatalogLink(slug);
  const isShopOnly = isShopManufacturer(slug);
  const tShop = await getTranslations("manufacturersPage.detail.shop");

  const manufacturerJsonLd = buildManufacturerJsonLd({
    manufacturer,
    products,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbsHome"), url: localePath(locale, "/") },
    {
      name: t("breadcrumbsList"),
      url: localePath(locale, "/manufacturers"),
    },
    {
      name: manufacturer.name,
      url: localePath(locale, `/manufacturers/${manufacturer.slug}`),
    },
  ]);

  return (
    <>
      <JsonLd data={[manufacturerJsonLd, breadcrumbJsonLd]} />
      <section className="bg-paper-100 pt-6 md:pt-10 pb-2">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <nav className="flex items-center gap-2 text-[12px] text-ink-500 flex-wrap">
            <Link href="/" className="hover:text-green-700">
              {t("breadcrumbsHome")}
            </Link>
            <span>/</span>
            <Link href="/manufacturers" className="hover:text-green-700">
              {t("breadcrumbsList")}
            </Link>
            <span>/</span>
            <span className="text-ink-900 font-medium truncate">
              {manufacturer.name}
            </span>
          </nav>
        </div>
      </section>

      <section className="bg-paper-100 pt-6 md:pt-8 pb-10 md:pb-14 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-14 items-start">
            <ManufacturerWordmark
              name={manufacturer.name}
              logo={manufacturer.logo}
              variant="hero"
            />

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-ink-500">
                  {manufacturer.country}
                </span>
                {manufacturer.tagline && (
                  <span className="font-mono text-[11px] text-ink-500">
                    · {manufacturer.tagline}
                  </span>
                )}
                <span className="ml-auto text-[12px] text-ink-500 tabular-nums">
                  {isShopOnly
                    ? tShop("badge")
                    : t("detail.products", { count: products.length })}
                </span>
              </div>

              <h1 className="display-heading text-ink-900 text-3xl md:text-4xl lg:text-[42px]">
                {manufacturer.name}
              </h1>
              {manufacturer.fullName &&
                manufacturer.fullName !== manufacturer.name && (
                  <p className="text-[14px] text-ink-500 -mt-3">
                    {manufacturer.fullName}
                  </p>
                )}

              <p className="text-[15px] leading-relaxed text-ink-700">
                {manufacturer.longDescription}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {catalogLink.isExternal ? (
                  <a
                    href={catalogLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green inline-flex items-center gap-2"
                  >
                    {tShop("openShopCta")}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </a>
                ) : (
                  <Link href={catalogLink.href} className="btn btn-green">
                    {t("detail.openCatalog")}
                  </Link>
                )}
                {manufacturer.website && (
                  <a
                    href={manufacturer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                  >
                    {t("detail.websiteCta")}
                  </a>
                )}
              </div>

              {isShopOnly && (
                <div className="rounded-2xl border border-green-200 bg-green-50/50 px-4 py-3 mt-2 flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-500 text-white text-[12px] font-bold">
                    ↗
                  </span>
                  <div>
                    <div className="font-display text-[14px] font-bold text-ink-900">
                      {tShop("title")}
                    </div>
                    <p className="text-[13px] text-ink-700 leading-relaxed mt-0.5">
                      {tShop("description")}
                    </p>
                  </div>
                </div>
              )}

              {presentCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-paper-200">
                  <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500 self-center">
                    {t("detail.categoriesLabel")}
                  </span>
                  {presentCategories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/catalog?category=${c.id}&manufacturer=${manufacturer.slug}`}
                      className="px-3 py-1 rounded-full bg-paper-100 text-ink-700 hover:bg-paper-200 text-[12px] font-medium transition-colors"
                    >
                      {c.name} · {products.filter((p) => p.categoryId === c.id).length}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="bg-paper-50 py-14 md:py-20">
          <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <h2 className="display-heading text-ink-900 text-3xl md:text-4xl">
                {t("detail.productsTitlePre")}{" "}
                <span className="text-green-600">{manufacturer.name}.</span>
              </h2>
              <Link
                href={`/catalog?manufacturer=${manufacturer.slug}`}
                className="text-[13px] font-semibold text-green-700 hover:text-green-600"
              >
                {t("detail.viewAllCount", { count: products.length })}
              </Link>
            </div>
            <ProductGrid products={products.slice(0, 12)} />
          </div>
        </section>
      )}
    </>
  );
}
