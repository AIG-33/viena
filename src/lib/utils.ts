import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function getCategoryLink(categoryId: string): CategoryLink {
  const external = EXTERNAL_CATEGORY_HREFS[categoryId];
  if (external) {
    return { href: external, isExternal: true };
  }
  return { href: `/catalog/${categoryId}`, isExternal: false };
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

export type ManufacturerCatalogLink = {
  href: string;
  isExternal: boolean;
};

export function getManufacturerCatalogLink(slug: string): ManufacturerCatalogLink {
  if (SHOP_MANUFACTURER_SLUGS.has(slug)) {
    return { href: SHOP_URL, isExternal: true };
  }
  return { href: `/catalog?manufacturer=${slug}`, isExternal: false };
}

export function isShopManufacturer(slug: string): boolean {
  return SHOP_MANUFACTURER_SLUGS.has(slug);
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
