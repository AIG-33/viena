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
import type { Category, CategoryFaq } from "@/types/category";
import type { Manufacturer } from "@/types/manufacturer";
import type { Product } from "@/types/product";
import type { BlogPost } from "@/types/blog";
import type { Locale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://viena.by";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// hreflang labels Google understands — keep aligned with the layout's
// `HTML_LANG` map and with sitemap.ts (`HREFLANG`).
const HREFLANG: Record<Locale, string> = {
  ru: "ru-BY",
  en: "en",
  zh: "zh-CN",
};

// Hard-coded mirror of routing.locales / routing.defaultLocale so this file
// stays free of next-intl runtime imports (called from `generateMetadata` in
// every route, including ones prerendered at build time).
const SEO_LOCALES: readonly Locale[] = ["ru", "en", "zh"] as const;
const SEO_DEFAULT_LOCALE: Locale = "ru";

/**
 * Build a `Metadata['alternates']` object with the page's own canonical and
 * a per-locale hreflang map (including `x-default`).
 *
 * `path` is the locale-less path of the *logical* page, e.g. `/`, `/about`,
 * `/catalog`, `/catalog/vacuum-systems`, `/blog/<slug>`. The helper produces:
 *
 *   - canonical: `/${locale}${path}`     (current locale's URL)
 *   - languages: each locale → `/${l}${path}`, plus `x-default` → RU.
 *
 * IMPORTANT: this MUST be called from every page's `generateMetadata`. The
 * locale layout no longer sets `alternates`, so any page without it would
 * fall back to *no* canonical at all (which lets Google pick the URL it
 * crawled — usually fine, but we want explicit canonicals to avoid the
 * "Variant of canonical" Search Console warning).
 */
export function buildAlternates(locale: Locale, path: string) {
  const norm = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const l of SEO_LOCALES) {
    languages[HREFLANG[l]] = `/${l}${norm}`;
  }
  languages["x-default"] = `/${SEO_DEFAULT_LOCALE}${norm}`;
  return {
    canonical: `/${locale}${norm}`,
    languages,
  };
}

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
 * `FAQPage` schema. Pass an array of `{ q, a }` pairs — they're rendered as
 * `Question` / `acceptedAnswer` nodes. Google parses this into rich result
 * accordions; AI assistants (ChatGPT/Perplexity) read it for direct answers.
 */
export function buildFaqJsonLd(
  faqs: CategoryFaq[]
): Record<string, unknown> | null {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

/**
 * `BlogPosting` schema for a single article. Includes `mentions` for any
 * cited references (ISO standards, WHO/CLSI guidelines) — search engines
 * use this as an authority signal and AI agents follow these for grounding.
 */
export function buildBlogPostingJsonLd(args: {
  post: BlogPost;
  locale: Locale;
}): Record<string, unknown> {
  const { post, locale } = args;
  const url = abs(localePath(locale, `/blog/${post.slug}`));
  const image = post.image ? abs(post.image) : abs("/images/logo-dark.png");
  const wordCount = post.body
    .map((b) => {
      if ("text" in b && b.text) return b.text.split(/\s+/).length;
      if ("items" in b) return b.items.join(" ").split(/\s+/).length;
      return 0;
    })
    .reduce((a, b) => a + b, 0);

  const mentions = (post.references ?? []).map((r) => ({
    "@type": "CreativeWork",
    name: r.title,
    url: r.url,
    publisher: r.publisher
      ? { "@type": "Organization", name: r.publisher }
      : undefined,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    inLanguage: locale,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    publisher: { "@id": ORG_ID },
    image,
    url,
    mainEntityOfPage: url,
    keywords: post.keywords?.join(", ") || post.tags.join(", "),
    articleSection: post.tags?.[0],
    wordCount,
    mentions: mentions.length > 0 ? mentions : undefined,
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/**
 * `Blog` schema for the blog index page.
 */
export function buildBlogJsonLd(args: {
  posts: BlogPost[];
  locale: Locale;
}): Record<string, unknown> {
  const { posts, locale } = args;
  const url = abs(localePath(locale, "/blog"));
  const items = posts.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: abs(localePath(locale, `/blog/${p.slug}`)),
    name: p.title,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items,
      numberOfItems: posts.length,
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
