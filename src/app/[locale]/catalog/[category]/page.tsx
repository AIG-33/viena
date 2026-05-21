import { notFound, redirect } from "next/navigation";
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
  buildAlternates,
  buildBreadcrumbJsonLd,
  buildCategoryJsonLd,
  buildFaqJsonLd,
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
      // Skip categories that explicitly redirect off the catalog (e.g.
      // partner solutions, shop redirects) — they have no SKU listing
      // and their tiles already link to the proper destination.
      if (cat.link) continue;
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

  // Prefer `seoTitle` / `seoDescription` if set in data — they're optimized
  // for length (≈ 60 / 160 chars) and contain the head synonyms. Fall back
  // to short `name` / `description` otherwise.
  const title = cat.seoTitle || cat.name;
  const description = cat.seoDescription || cat.description;
  const keywords = cat.seoKeywords?.length ? cat.seoKeywords : undefined;

  return {
    title,
    description,
    keywords,
    alternates: buildAlternates(locale, `/catalog/${cat.id}`),
    openGraph: {
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const cat = getCategoryById(category, locale);
  if (!cat) notFound();
  // Categories with an explicit `link` (partner solutions, shop redirects)
  // have no catalog listing — bounce direct hits to the real landing.
  if (cat.link) {
    const target = cat.link.startsWith("http")
      ? cat.link
      : `/${locale}${cat.link.startsWith("/") ? "" : "/"}${cat.link}`;
    redirect(target);
  }

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
  const faqJsonLd = buildFaqJsonLd(cat.faqs ?? []);
  const jsonLdNodes: Record<string, unknown>[] = [
    categoryJsonLd,
    breadcrumbJsonLd,
  ];
  if (faqJsonLd) jsonLdNodes.push(faqJsonLd);

  return (
    <>
      <JsonLd data={jsonLdNodes} />
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

      {(cat.intro || (cat.faqs && cat.faqs.length > 0)) && (
        <section className="bg-paper-50 border-t border-paper-200 py-14 md:py-20">
          <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              {cat.intro && (
                <div className="lg:col-span-7">
                  <span className="eyebrow">
                    <span className="dot" />
                    {tCatalog("about")}
                  </span>
                  <h2 className="display-heading text-ink-900 text-2xl md:text-3xl mt-3 mb-5">
                    {cat.name}
                  </h2>
                  <p className="text-[15px] md:text-[16px] leading-relaxed text-ink-700 whitespace-pre-line">
                    {cat.intro}
                  </p>
                </div>
              )}
              {cat.faqs && cat.faqs.length > 0 && (
                <div className="lg:col-span-5">
                  <span className="eyebrow">
                    <span className="dot" />
                    {tCatalog("faq")}
                  </span>
                  <h2 className="display-heading text-ink-900 text-2xl md:text-3xl mt-3 mb-5">
                    FAQ
                  </h2>
                  <div className="space-y-4">
                    {cat.faqs.map((faq, idx) => (
                      <details
                        key={idx}
                        className="group bg-white border border-paper-200 rounded-lg p-4 md:p-5 [&_summary::-webkit-details-marker]:hidden"
                      >
                        <summary className="flex items-start justify-between gap-3 cursor-pointer list-none">
                          <h3 className="font-display text-ink-900 text-[15px] md:text-[16px] leading-snug">
                            {faq.q}
                          </h3>
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-45 mt-0.5"
                          >
                            +
                          </span>
                        </summary>
                        <p className="mt-3 text-[14px] md:text-[15px] leading-relaxed text-ink-700">
                          {faq.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
