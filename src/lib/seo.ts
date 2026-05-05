/**
 * JSON-LD payload builders.
 *
 * All builders return plain `Record<string, unknown>` objects — they're meant
 * to be passed to `<JsonLd data={...} />`. Builders never touch DOM and are
 * safe to call from Server Components.
 *
 * Conventions:
 *  - Absolute URLs everywhere (search engines de-duplicate by URL).
 *  - The `Organization` and `WebSite` nodes already live in the locale layout
 *    so we just reference them by `@id` (`${SITE_URL}/#organization`).
 *  - Locale-prefixed paths (`/ru/catalog/...`) are intentional — that's what
 *    the rendered page actually serves and what we want indexed per-locale.
 */
import type { Category } from "@/types/category";
import type { Manufacturer } from "@/types/manufacturer";
import type { Product } from "@/types/product";
import type { Locale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://viena.by";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function abs(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

/**
 * `BreadcrumbList` schema for the page chain.
 *
 * Pass a list of breadcrumb items in order (from "home" to current page).
 */
export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}

/**
 * `Product` schema for a single SKU (or family head — for vacuum-systems
 * we still emit `Product` with `additionalProperty` listing the variant
 * count so AI agents understand it's a family).
 *
 * Price is intentionally omitted (B2B "request a quote" model). We still
 * emit `offers.availability` + `offers.seller` so search engines link the
 * product to our `Organization`.
 */
export function buildProductJsonLd(args: {
  product: Product;
  category?: Category;
  manufacturer?: Manufacturer;
  locale: Locale;
}): Record<string, unknown> {
  const { product, category, manufacturer, locale } = args;
  const url = abs(localePath(locale, `/catalog/${product.categoryId}/${product.slug}`));
  const images = product.images.length
    ? product.images.map((img) => abs(img))
    : [abs("/images/logo-dark.png")];

  const sku = product.catalogNumber || `P-${product.id.slice(-6).toUpperCase()}`;
  const description = (product.shortDescription || product.description || "").slice(0, 5000);

  const variantCount = product.variants?.length ?? 0;
  const additionalProperty: Record<string, unknown>[] = [];
  if (variantCount > 0) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "variantCount",
      value: variantCount,
    });
  }
  if (product.subcategory) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "subcategory",
      value: product.subcategory,
    });
  }
  for (const spec of product.specs ?? []) {
    if (!spec.key || !spec.value) continue;
    additionalProperty.push({
      "@type": "PropertyValue",
      name: spec.key,
      value: spec.value,
    });
  }

  const aliases = (product.searchKeywords ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== product.name.toLowerCase());

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    alternateName: aliases.length > 0 ? aliases : undefined,
    description,
    image: images,
    url,
    sku,
    mpn: product.catalogNumber || undefined,
    category: category?.name,
    keywords: aliases.length > 0 ? aliases.join(", ") : undefined,
    inLanguage: locale,
    isFamilyFriendly: true,
  };

  if (manufacturer) {
    node.brand = {
      "@type": "Brand",
      name: manufacturer.name,
      logo: manufacturer.logo ? abs(manufacturer.logo) : undefined,
    };
    node.manufacturer = {
      "@type": "Organization",
      name: manufacturer.fullName || manufacturer.name,
      url: manufacturer.website,
    };
  }

  if (additionalProperty.length > 0) {
    node.additionalProperty = additionalProperty;
  }

  node.offers = {
    "@type": "Offer",
    url,
    priceCurrency: "BYN",
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/PreOrder",
    businessFunction: "https://schema.org/Sell",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "BY" },
  };

  return node;
}

/**
 * `CollectionPage` + `ItemList` schema for a category landing page.
 */
export function buildCategoryJsonLd(args: {
  category: Category;
  products: Product[];
  locale: Locale;
}): Record<string, unknown> {
  const { category, products, locale } = args;
  const url = abs(localePath(locale, `/catalog/${category.id}`));
  const items = products.slice(0, 30).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: abs(localePath(locale, `/catalog/${category.id}/${p.slug}`)),
    name: p.name,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: category.name,
    description: category.description,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items,
      numberOfItems: products.length,
    },
  };
}

/**
 * `Organization` schema for a manufacturer landing page (refers to the
 * manufacturer brand itself, not us — VIENA is the seller / sameAs link).
 */
export function buildManufacturerJsonLd(args: {
  manufacturer: Manufacturer;
  products: Product[];
  locale: Locale;
}): Record<string, unknown> {
  const { manufacturer, products, locale } = args;
  const url = abs(localePath(locale, `/manufacturers/${manufacturer.slug}`));
  const sample = products.slice(0, 12).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: abs(localePath(locale, `/catalog/${p.categoryId}/${p.slug}`)),
    name: p.name,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#brand`,
    name: manufacturer.fullName || manufacturer.name,
    alternateName: manufacturer.name,
    description: manufacturer.shortDescription,
    url: manufacturer.website,
    logo: manufacturer.logo ? abs(manufacturer.logo) : undefined,
    address: manufacturer.country
      ? { "@type": "PostalAddress", addressCountry: manufacturer.country }
      : undefined,
    mainEntityOfPage: url,
    subjectOf: {
      "@type": "WebPage",
      url,
      inLanguage: locale,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: sample,
        numberOfItems: products.length,
      },
    },
  };
}
