import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getAllCategories,
  getCategoryById,
  getProductsByCategoryId,
  getVacuumFamilies,
} from "@/lib/data";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { VacuumCatalog } from "@/components/catalog/VacuumCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildCategoryJsonLd,
  localePath,
} from "@/lib/seo";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

interface CategoryPageProps {
  params: Promise<{ locale: Locale; category: string }>;
}

export function generateStaticParams() {
  const categories = getAllCategories();
  const out: { locale: Locale; category: string }[] = [];
  for (const locale of routing.locales) {
    for (const cat of categories) {
      out.push({ locale: locale as Locale, category: cat.id });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = getCategoryById(category, locale);
  if (!cat) return {};
  return { title: cat.name, description: cat.description };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const cat = getCategoryById(category, locale);
  if (!cat) notFound();

  const tNav = await getTranslations("nav");
  const tCatalog = await getTranslations("catalog");

  const isVacuum = category === "vacuum-systems";
  const vacuumData = isVacuum ? getVacuumFamilies(locale) : null;
  const products = isVacuum
    ? (vacuumData?.families ?? [])
    : getProductsByCategoryId(category, locale);
  const skuCount = isVacuum
    ? (vacuumData?.families ?? []).reduce(
        (s, f) => s + (f.variants?.length ?? 0),
        0
      )
    : products.length;

  const categoryJsonLd = buildCategoryJsonLd({
    category: cat,
    products,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tNav("home"), url: localePath(locale, "/") },
    { name: tNav("catalog"), url: localePath(locale, "/catalog") },
    { name: cat.name, url: localePath(locale, `/catalog/${cat.id}`) },
  ]);

  return (
    <>
      <JsonLd data={[categoryJsonLd, breadcrumbJsonLd]} />
      <section className="bg-paper-100 pt-8 md:pt-12 pb-10 md:pb-12 border-b border-paper-200">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <nav className="flex items-center gap-2 text-[12px] text-ink-500 mb-6">
            <Link href="/" className="hover:text-green-700 transition-colors">{tNav("home")}</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-green-700 transition-colors">{tNav("catalog")}</Link>
            <span>/</span>
            <span className="text-ink-900 font-medium truncate">{cat.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <span className="eyebrow">
                <span className="dot" />
                {isVacuum
                  ? `${products.length} · ${skuCount} SKU`
                  : tCatalog("productCount", { count: products.length })}
              </span>
              <h1 className="display-heading text-ink-900 text-4xl md:text-5xl lg:text-6xl mt-4">
                {cat.name}
              </h1>
              <p className="text-[15px] text-ink-600 max-w-2xl mt-3">{cat.description}</p>
            </div>
            <Link href="/catalog" className="btn btn-ghost shrink-0">
              ← {tCatalog("filters.categories")}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white pt-8 md:pt-10 pb-20">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          {isVacuum && vacuumData ? (
            <VacuumCatalog
              families={vacuumData.families}
              subcategories={vacuumData.subcategories}
              capColors={vacuumData.capColors}
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </section>
    </>
  );
}
