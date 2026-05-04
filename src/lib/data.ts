import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Service } from "@/types/service";
import type { Project } from "@/types/project";
import type { Manufacturer } from "@/types/manufacturer";
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

type LocaledCategory = Category & Translatable;
type LocaledManufacturer = Manufacturer & Translatable;
type LocaledProduct = Product & Translatable;
type LocaledService = Service & Translatable;
type LocaledProject = Project & Translatable;

const categoriesRaw = categoriesData as LocaledCategory[];
const manufacturersRaw = manufacturersData as LocaledManufacturer[];
const servicesRaw = servicesData as LocaledService[];
const projectsRaw = projectsData as LocaledProject[];

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
  return {
    ...c,
    productCount: allProductsRaw.filter((p) => p.categoryId === c.id).length,
  };
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

export function searchProducts(
  query: string,
  locale: Locale = "ru"
): Product[] {
  if (!query.trim()) return getAllProducts(locale);
  const q = query.toLowerCase();
  // Match against the localised view (so EN search works on EN pages).
  const localised = applyLocaleAll(allProductsRaw, locale) as Product[];
  return localised.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(q)) ||
      (p.catalogNumber && p.catalogNumber.toLowerCase().includes(q))
  );
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
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(q)) ||
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

export function getRelatedProducts(
  product: Product,
  limit = 4,
  locale: Locale = "ru"
): Product[] {
  return applyLocaleAll(
    allProductsRaw
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, limit),
    locale
  ) as Product[];
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
