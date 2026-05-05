export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductOption {
  title: string;
  variants: string[];
}

export interface ProductDataTable {
  title?: string;
  header: string[];
  rows: string[][];
}

export interface VariantAttribute {
  key: string;
  label_ru: string;
  label_en: string;
  label_zh: string;
}

export interface ProductVariant {
  catalogNumber: string;
  closure?: string | null;
  volume?: string | null;
  size?: string | null;
  capColor?: string | null;
  ringColor?: string | null;
  pack?: string | null;
  /** Original product name from the manufacturer (RCETH / GBO catalogue). */
  sourceName?: string | null;
  /** Tube material (PET / PP / glass) when relevant. */
  material?: string | null;
  /** Label kind (standard / G-barcode / transparent / paper / polyester). */
  label?: string | null;
  /** Free-form flags (e.g. `g-barcode`, `high-altitude`, `sterile`). */
  flags?: string[];
  // Free-form scalar attributes for non-tube items (transport, accessories).
  [key: string]: string | string[] | null | undefined;
}

/** Narrows an indexed `ProductVariant` value to a string when present. */
export function getVariantString(
  v: ProductVariant,
  key: string
): string | undefined {
  const val = v[key];
  return typeof val === "string" ? val : undefined;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  /**
   * Vacuum-systems extension — narrows the catalog into UI tabs
   * (venous / capillary / urine / esr / tourniquet / transport / container / other).
   */
  subcategory?: string;
  /** Additive code for venous/capillary tubes (e.g. `k2edta`, `serum-cat`). */
  additive?: string | null;
  /** Cap colour token (e.g. `lavender`, `blue`, `red`). */
  capColor?: string | null;
  /** Ring colour token (or `null` for no ring). */
  ringColor?: string | null;
  images: string[];
  specs: ProductSpec[];
  options?: ProductOption[];
  /** Variant configurator metadata (vacuum-systems uses this). */
  variantAttributes?: VariantAttribute[];
  variants?: ProductVariant[];
  dataTable?: ProductDataTable;
  tags: string[];
  featured: boolean;
  inStock: boolean;
  catalogNumber?: string;
  manufacturer?: string;
  createdAt: string;
}
