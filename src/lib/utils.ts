import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category } from "@/types/category";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SHOP_URL = "https://shop.viena.by/";

const EXTERNAL_CATEGORY_HREFS: Record<string, string> = {
  "scientific-reagents": SHOP_URL,
};

export type CategoryLink = {
  href: string;
  isExternal: boolean;
};

/**
 * Resolve the tile / CTA target for a catalog category. Priority:
 *  1. Explicit `link` field on the category (internal route or absolute URL).
 *  2. Hard-coded external redirect (e.g. scientific-reagents → shop).
 *  3. Default `/catalog/<id>` landing page.
 *
 * Accepts either a full `Category` or just an id — keeps backwards
 * compatibility with call sites that don't have the full object handy.
 */
export function getCategoryLink(
  categoryOrId: string | Pick<Category, "id" | "link">
): CategoryLink {
  const id =
    typeof categoryOrId === "string" ? categoryOrId : categoryOrId.id;
  const explicit =
    typeof categoryOrId === "object" ? categoryOrId.link : undefined;
  if (explicit) {
    return {
      href: explicit,
      isExternal: /^https?:\/\//i.test(explicit),
    };
  }
  const external = EXTERNAL_CATEGORY_HREFS[id];
  if (external) {
    return { href: external, isExternal: true };
  }
  return { href: `/catalog/${id}`, isExternal: false };
}

const SHOP_MANUFACTURER_SLUGS = new Set<string>([
  "thermo-fisher-scientific",
  "illumina",
  "qiagen",
  "promega",
  "new-england-biolabs",
  "miltenyi-biotec",
  "nimagen",
]);

/**
 * Manufacturers that don't have SKU rows in the catalog because their
 * deliverable is a deployed solution / service rather than a product
 * line. The detail page routes the primary CTA to the solution page
 * instead of an empty `/catalog?manufacturer=...` filter view.
 */
const SOLUTION_MANUFACTURER_HREFS: Record<string, string> = {
  samplify: "/solutions/mednais",
};

export type ManufacturerCatalogLink = {
  href: string;
  isExternal: boolean;
};

export function getManufacturerCatalogLink(slug: string): ManufacturerCatalogLink {
  if (SHOP_MANUFACTURER_SLUGS.has(slug)) {
    return { href: SHOP_URL, isExternal: true };
  }
  const solution = SOLUTION_MANUFACTURER_HREFS[slug];
  if (solution) {
    return { href: solution, isExternal: false };
  }
  return { href: `/catalog?manufacturer=${slug}`, isExternal: false };
}

export function isShopManufacturer(slug: string): boolean {
  return SHOP_MANUFACTURER_SLUGS.has(slug);
}

export function isSolutionManufacturer(slug: string): boolean {
  return slug in SOLUTION_MANUFACTURER_HREFS;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
