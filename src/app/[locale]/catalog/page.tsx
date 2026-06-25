import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getAllCategories,
  getAllManufacturers,
  getAllProducts,
  filterProducts,
} from "@/lib/data";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CategoryTile } from "@/components/catalog/CategoryTile";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { PageHero } from "@/components/layout/PageHero";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildAlternates } from "@/lib/seo";
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
  const t = await getTranslations({ locale, namespace: "catalog.meta" });
  const keywords =
    locale === "ru"
      ? [
          "каталог медтехники",
          "лабораторное оборудование",
          "вакуумные пробирки для взятия крови",
          "реагенты для ПЦР",
          "реагенты для гистологии",
          "ланцеты безопасные",
          "ветеринарные анализаторы",
          "купить лабораторное оборудование Беларусь",
        ]
      : undefined;
  return {
    title: t("title"),
    description: t("description"),
    keywords,
    alternates: buildAlternates(locale, "/catalog"),
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const tNav = await getTranslations("nav");
  const sp = await searchParams;
  const categories = getAllCategories(locale);
  const manufacturers = getAllManufacturers(locale);

  const hasFilters = !!(sp.category || sp.q || sp.manufacturer);
  const products = hasFilters
    ? filterProducts(sp.category, sp.q, sp.manufacturer, locale)
    : [];

  return (
    <>
      <Breadcrumbs
        items={[
          { name: tNav("home"), href: "/" },
          { name: tNav("catalog"), href: "/catalog" },
        ]}
      />
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

      <section className="bg-white border-b border-paper-200 py-5 md:py-6">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <CatalogSearch
            products={getAllProducts(locale)}
            categories={categories}
          />
        </div>
      </section>

      <section className="bg-white pt-8 md:pt-10 pb-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          {hasFilters ? (
            <>
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
            </>
          ) : (
            <>
              <h2 className="font-display text-ink-900 text-2xl md:text-[28px] tracking-[-0.01em] mb-5 md:mb-7">
                {t("categoryGrid.title")}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {categories.map((c) => (
                  <CategoryTile
                    key={c.id}
                    category={c}
                    productsLabel={t("categoryGrid.productsLabel")}
                    shopLabel={t("categoryGrid.shopLabel")}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
