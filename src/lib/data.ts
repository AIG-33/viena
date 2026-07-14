import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Service } from "@/types/service";
import type { Project } from "@/types/project";
import type { Manufacturer } from "@/types/manufacturer";
import type { BlogPost } from "@/types/blog";
import type { Locale } from "@/i18n/routing";
import { applyLocale, applyLocaleAll, type Translatable } from "@/lib/i18n-data";

import categoriesData from "../../data/categories.json";
import manufacturersData from "../../data/manufacturers.json";
import consumables from "../../data/products/consumables.json";
import vacuumSystems from "../../data/products/vacuum-systems.json";
import equipment from "../../data/products/equipment.json";
import reagents from "../../data/products/reagents.json";
import pathomorphology from "../../data/products/pathomorphology.json";
import veterinary from "../../data/products/veterinary.json";
import scientificReagents from "../../data/products/scientific-reagents.json";
import lancets from "../../data/products/lancets.json";
import servicesData from "../../data/services.json";
import projectsData from "../../data/projects.json";
import blogData from "../../data/blog.json";

type LocaledCategory = Category & Translatable;
type LocaledManufacturer = Manufacturer & Translatable;
type LocaledProduct = Product & Translatable;
type LocaledService = Service & Translatable;
type LocaledProject = Project & Translatable;

const categoriesRaw = categoriesData as LocaledCategory[];
const manufacturersRaw = manufacturersData as LocaledManufacturer[];
const servicesRaw = servicesData as LocaledService[];
const projectsRaw = projectsData as LocaledProject[];
const blogRaw = blogData as BlogPost[];

const allProductsRaw: LocaledProduct[] = [
  ...consumables,
  ...vacuumSystems,
  ...equipment,
  ...reagents,
  ...pathomorphology,
  ...veterinary,
  ...scientificReagents,
  ...lancets,
] as LocaledProduct[];

function withProductCount(c: LocaledCategory): LocaledCategory {
  // Count every SKU – when a product is a family of variants we count each
  // variant, otherwise the product itself counts as one. This matches what
  // users see when they actually drill into the category.
  const items = allProductsRaw.filter((p) => p.categoryId === c.id);
  const productCount = items.reduce(
    (sum, p) => sum + (p.variants && p.variants.length > 0 ? p.variants.length : 1),
    0
  );
  return { ...c, productCount };
}

export function getAllCategories(locale: Locale = "ru"): Category[] {
  return categoriesRaw
    .map(withProductCount)
    .map((c) => applyLocale(c, locale)) as Category[];
}

export function getCategoryById(
  id: string,
  locale: Locale = "ru"
): Category | undefined {
  const found = categoriesRaw.find((c) => c.id === id);
  if (!found) return undefined;
  return applyLocale(withProductCount(found), locale) as Category;
}

export function getAllProducts(locale: Locale = "ru"): Product[] {
  return applyLocaleAll(allProductsRaw, locale) as Product[];
}

export function getProductsByCategoryId(
  categoryId: string,
  locale: Locale = "ru"
): Product[] {
  return applyLocaleAll(
    allProductsRaw.filter((p) => p.categoryId === categoryId),
    locale
  ) as Product[];
}

/**
 * Vacuum-systems specific accessor — returns the `Product[]` for that category
 * alongside the unique subcategory order observed in the data file. Used by
 * the bespoke configurator UI for `/catalog/vacuum-systems`.
 */
export function getVacuumFamilies(locale: Locale = "ru"): {
  families: Product[];
  subcategories: string[];
  capColors: string[];
} {
  const families = applyLocaleAll(
    allProductsRaw.filter((p) => p.categoryId === "vacuum-systems"),
    locale
  ) as Product[];
  const subSeen = new Set<string>();
  const subcategories: string[] = [];
  const capSeen = new Set<string>();
  const capColors: string[] = [];
  for (const f of families) {
    const sub = f.subcategory ?? "other";
    if (!subSeen.has(sub)) {
      subSeen.add(sub);
      subcategories.push(sub);
    }
    if (f.capColor && !capSeen.has(f.capColor)) {
      capSeen.add(f.capColor);
      capColors.push(f.capColor);
    }
  }
  return { families, subcategories, capColors };
}

/**
 * Consumables accessor — returns the family `Product[]` for the consumables
 * category (each family carries `variantAttributes` + `variants`). Used by the
 * bespoke configurator UI for `/catalog/consumables`.
 */
export function getConsumableFamilies(locale: Locale = "ru"): Product[] {
  return applyLocaleAll(
    allProductsRaw.filter((p) => p.categoryId === "consumables"),
    locale
  ) as Product[];
}

export function getProductBySlug(
  categoryId: string,
  slug: string,
  locale: Locale = "ru"
): Product | undefined {
  const found = allProductsRaw.find(
    (p) => p.categoryId === categoryId && p.slug === slug
  );
  return found ? (applyLocale(found, locale) as Product) : undefined;
}

function productMatchesQuery(p: Product, q: string): boolean {
  return (
    p.name.toLowerCase().includes(q) ||
    p.shortDescription.toLowerCase().includes(q) ||
    p.tags.some((t) => t.toLowerCase().includes(q)) ||
    (p.searchKeywords ?? []).some((k) => k.toLowerCase().includes(q)) ||
    (p.manufacturer ? p.manufacturer.toLowerCase().includes(q) : false) ||
    (p.catalogNumber ? p.catalogNumber.toLowerCase().includes(q) : false)
  );
}

export function searchProducts(
  query: string,
  locale: Locale = "ru"
): Product[] {
  if (!query.trim()) return getAllProducts(locale);
  const q = query.toLowerCase();
  // Match against the localised view (so EN search works on EN pages).
  const localised = applyLocaleAll(allProductsRaw, locale) as Product[];
  return localised.filter((p) => productMatchesQuery(p, q));
}

export function filterProducts(
  categoryId?: string,
  query?: string,
  manufacturerSlug?: string,
  locale: Locale = "ru"
): Product[] {
  let products: LocaledProduct[] = allProductsRaw;
  if (categoryId) {
    products = products.filter((p) => p.categoryId === categoryId);
  }
  if (manufacturerSlug) {
    products = products.filter((p) => p.manufacturer === manufacturerSlug);
  }
  let localised = applyLocaleAll(products, locale) as Product[];
  if (query && query.trim()) {
    const q = query.toLowerCase();
    const manuByName = manufacturersRaw.find(
      (m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q)
    );
    localised = localised.filter(
      (p) =>
        productMatchesQuery(p, q) ||
        (manuByName && p.manufacturer === manuByName.slug)
    );
  }
  return localised;
}

export function getFeaturedProducts(locale: Locale = "ru"): Product[] {
  return applyLocaleAll(
    allProductsRaw.filter((p) => p.featured),
    locale
  ) as Product[];
}

/**
 * Pick "related" products with smart relevance ranking. Boosts internal
 * linking and improves SEO crawl depth — Google rewards pages that connect
 * to other pages on the same topic via descriptive anchors.
 *
 * Scoring (higher = better):
 *  - same subcategory (matched on `specs.Подкатегория`)  +10
 *  - same manufacturer                                   +5
 *  - same category                                        +1
 *  - shared tag                                           +1 per tag
 *
 * The current product is excluded; ties break by `featured` then `inStock`.
 */
export function getRelatedProducts(
  product: Product,
  limit = 4,
  locale: Locale = "ru"
): Product[] {
  const subcat = (product.specs ?? []).find(
    (s) => s.key === "Подкатегория"
  )?.value;
  const myTags = new Set(product.tags ?? []);

  const candidates = allProductsRaw
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let score = 0;
      if (p.categoryId === product.categoryId) score += 1;
      if (subcat) {
        const otherSub = (p.specs ?? []).find(
          (s) => s.key === "Подкатегория"
        )?.value;
        if (otherSub === subcat) score += 10;
      }
      if (
        product.manufacturer &&
        p.manufacturer === product.manufacturer
      )
        score += 5;
      if (myTags.size > 0 && Array.isArray(p.tags)) {
        for (const t of p.tags) if (myTags.has(t)) score += 1;
      }
      if (p.featured) score += 0.5;
      if (p.inStock) score += 0.25;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);

  return applyLocaleAll(candidates, locale) as Product[];
}

export function getAllServices(locale: Locale = "ru"): Service[] {
  return applyLocaleAll(servicesRaw, locale) as Service[];
}

export function getAllProjects(locale: Locale = "ru"): Project[] {
  return applyLocaleAll(projectsRaw, locale) as Project[];
}

export function getProjectById(
  id: string,
  locale: Locale = "ru"
): Project | undefined {
  const found = projectsRaw.find((p) => p.id === id);
  return found ? (applyLocale(found, locale) as Project) : undefined;
}

/**
 * Blog posts are stored RU-only (no `i18n` block today). The `locale`
 * parameter is reserved for future translations but currently has no
 * effect — keeping it on the signature for API consistency.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAllBlogPosts(_locale: Locale = "ru"): BlogPost[] {
  return [...blogRaw].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getBlogPostBySlug(
  slug: string,
  _locale: Locale = "ru"
): BlogPost | undefined {
  return blogRaw.find((p) => p.slug === slug);
}

export function getRelatedBlogPosts(
  post: BlogPost,
  limit = 3
): BlogPost[] {
  return blogRaw
    .filter((p) => p.id !== post.id)
    .map((p) => {
      let score = 0;
      if (p.categoryId && p.categoryId === post.categoryId) score += 5;
      const sharedTags =
        p.tags?.filter((t) => post.tags?.includes(t)).length ?? 0;
      score += sharedTags;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

function withManufacturerCount(m: LocaledManufacturer): LocaledManufacturer {
  return {
    ...m,
    productCount: allProductsRaw.filter((p) => p.manufacturer === m.slug).length,
  };
}

export function getAllManufacturers(locale: Locale = "ru"): Manufacturer[] {
  return manufacturersRaw
    .map(withManufacturerCount)
    .map((m) => applyLocale(m, locale)) as Manufacturer[];
}

export function getManufacturerBySlug(
  slug: string,
  locale: Locale = "ru"
): Manufacturer | undefined {
  const found = manufacturersRaw.find((m) => m.slug === slug);
  return found
    ? (applyLocale(withManufacturerCount(found), locale) as Manufacturer)
    : undefined;
}

export function getProductsByManufacturer(
  slug: string,
  locale: Locale = "ru"
): Product[] {
  return applyLocaleAll(
    allProductsRaw.filter((p) => p.manufacturer === slug),
    locale
  ) as Product[];
}
