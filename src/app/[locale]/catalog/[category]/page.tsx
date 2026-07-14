import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getAllCategories,
  getAllProducts,
  getCategoryById,
  getProductsByCategoryId,
  getVacuumFamilies,
  getConsumableFamilies,
  getLancetFamilies,
} from "@/lib/data";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { VacuumCatalog } from "@/components/catalog/VacuumCatalog";
import { ConsumablesCatalog } from "@/components/catalog/ConsumablesCatalog";
import { VariantCatalog } from "@/components/catalog/VariantCatalog";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildAlternates,
  buildBreadcrumbJsonLd,
  buildCategoryJsonLd,
  buildFaqJsonLd,
  localePath,
} from "@/lib/seo";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

interface CategoryPageProps {
  params: Promise<{ locale: Locale; category: string }>;
}

/**
 * Per-category pastel tint for the hero gradient + blobs. Keeps the same
 * visual language as the catalog hero (subtle radial glows + animated
 * blur blobs) but gives each section its own gentle accent so users
 * navigating between categories see clear visual differentiation.
 *
 * `tint1` / `tint2` are RGB triples (no alpha) consumed by the CSS
 * `.cat-hero-bg` class via `--cat-tint-1` / `--cat-tint-2` custom
 * properties. `blob1` / `blob2` are full rgba() values applied to the
 * floating blur disks.
 */
const CATEGORY_TINT: Record<
  string,
  { tint1: string; tint2: string; blob1: string; blob2: string }
> = {
  consumables: {
    tint1: "186, 230, 253",
    tint2: "125, 211, 252",
    blob1: "rgba(125, 211, 252, 0.40)",
    blob2: "rgba(186, 230, 253, 0.55)",
  },
  "vacuum-systems": {
    tint1: "254, 205, 211",
    tint2: "253, 164, 175",
    blob1: "rgba(253, 164, 175, 0.40)",
    blob2: "rgba(254, 205, 211, 0.55)",
  },
  lancets: {
    tint1: "254, 202, 202",
    tint2: "252, 165, 165",
    blob1: "rgba(248, 113, 113, 0.34)",
    blob2: "rgba(254, 202, 202, 0.55)",
  },
  equipment: {
    tint1: "199, 210, 254",
    tint2: "165, 180, 252",
    blob1: "rgba(165, 180, 252, 0.38)",
    blob2: "rgba(199, 210, 254, 0.55)",
  },
  reagents: {
    tint1: "221, 214, 254",
    tint2: "196, 181, 253",
    blob1: "rgba(196, 181, 253, 0.38)",
    blob2: "rgba(221, 214, 254, 0.55)",
  },
  pathomorphology: {
    tint1: "251, 207, 232",
    tint2: "244, 114, 182",
    blob1: "rgba(244, 114, 182, 0.30)",
    blob2: "rgba(251, 207, 232, 0.55)",
  },
  veterinary: {
    tint1: "254, 215, 170",
    tint2: "253, 186, 116",
    blob1: "rgba(253, 186, 116, 0.38)",
    blob2: "rgba(254, 215, 170, 0.55)",
  },
  "scientific-reagents": {
    tint1: "253, 230, 138",
    tint2: "252, 211, 77",
    blob1: "rgba(252, 211, 77, 0.36)",
    blob2: "rgba(253, 230, 138, 0.55)",
  },
};

const DEFAULT_TINT = {
  tint1: "215, 246, 233",
  tint2: "78, 217, 168",
  blob1: "rgba(135, 227, 188, 0.35)",
  blob2: "rgba(185, 239, 214, 0.55)",
};

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
  const isConsumables = category === "consumables";
  const isLancets = category === "lancets";
  const isVariantCatalog = isVacuum || isConsumables || isLancets;
  const vacuumData = isVacuum ? getVacuumFamilies(locale) : null;
  const consumableFamilies = isConsumables ? getConsumableFamilies(locale) : null;
  const lancetFamilies = isLancets ? getLancetFamilies(locale) : null;
  const products = isVacuum
    ? (vacuumData?.families ?? [])
    : isConsumables
      ? (consumableFamilies ?? [])
      : isLancets
        ? (lancetFamilies ?? [])
        : getProductsByCategoryId(category, locale);
  const skuCount = isVariantCatalog
    ? products.reduce((s, f) => s + (f.variants?.length ?? 0), 0)
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

  const tint = CATEGORY_TINT[category] ?? DEFAULT_TINT;
  const heroStyle = {
    "--cat-tint-1": tint.tint1,
    "--cat-tint-2": tint.tint2,
  } as CSSProperties;

  return (
    <>
      <JsonLd data={jsonLdNodes} />
      <section
        className="relative overflow-hidden cat-hero-bg pt-8 md:pt-12 pb-10 md:pb-12 border-b border-paper-200"
        style={heroStyle}
      >
        <div
          aria-hidden
          className="hero-blob hero-blob-a -top-32 -left-24 h-[340px] w-[340px]"
          style={{ background: tint.blob1 }}
        />
        <div
          aria-hidden
          className="hero-blob hero-blob-b -bottom-28 -right-16 h-[300px] w-[300px]"
          style={{ background: tint.blob2 }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent z-10"
        />

        <div className="relative z-10 max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
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
                {isVariantCatalog
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

      <section className="bg-white border-b border-paper-200 py-5 md:py-6">
        <div className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14">
          <CatalogSearch
            products={getAllProducts(locale)}
            categories={getAllCategories(locale)}
          />
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
          ) : isConsumables && consumableFamilies ? (
            <ConsumablesCatalog families={consumableFamilies} />
          ) : isLancets && lancetFamilies ? (
            <VariantCatalog families={lancetFamilies} />
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
