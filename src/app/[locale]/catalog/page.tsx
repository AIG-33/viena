import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getAllCategories,
  getAllManufacturers,
  filterProducts,
} from "@/lib/data";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { PageHero } from "@/components/layout/PageHero";
import type { Locale } from "@/i18n/routing";

interface CatalogPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
    manufacturer?: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog.hero" });
  return { title: t("titleLine1Accent"), description: t("description") };
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const sp = await searchParams;
  const categories = getAllCategories(locale);
  const manufacturers = getAllManufacturers(locale);
  const products = filterProducts(sp.category, sp.q, sp.manufacturer, locale);

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={
          <>
            {t("hero.titleLine1")} <span className="text-grad-green">{t("hero.titleLine1Accent")}</span>
            <br />
            {t("hero.titleLine2Pre")} <span className="text-grad-green">{t("hero.titleLine2Accent")}</span>
          </>
        }
        description={t("hero.description")}
      />

      <section className="bg-white pt-8 md:pt-10 pb-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <Suspense>
            <CatalogFilters
              categories={categories}
              manufacturers={manufacturers}
              currentCategory={sp.category}
              currentQuery={sp.q}
              currentManufacturer={sp.manufacturer}
            />
          </Suspense>

          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
