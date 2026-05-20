import type { ProductVariant } from "@/types/product";

/** Find the variant whose attribute values match `selection` exactly. */
export function findVariant(
  variants: ProductVariant[],
  selection: Record<string, string>
): ProductVariant | undefined {
  return variants.find((v) =>
    Object.entries(selection).every(([k, val]) => v[k] === val)
  );
}

/** Distinct string values present for `key` across `variants`, preserving
 * source order. */
export function uniqueValues(
  variants: ProductVariant[],
  key: string
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    const val = v[key];
    if (typeof val === "string" && !seen.has(val)) {
      seen.add(val);
      out.push(val);
    }
  }
  return out;
}

/**
 * Returns a new selection that:
 *  - locks `key` to `val`,
 *  - keeps as many of the previous attribute values as possible,
 *  - drops the conflicting ones and back-fills them from the variant that
 *    overlaps the previous selection the most — so the result always
 *    corresponds to a real SKU.
 *
 * Shared by `VacuumProductCard` (catalog tile) and `VacuumProductDetail`
 * (product page) so both surfaces switch the visible catalog number when
 * the user clicks an attribute chip.
 */
export function reconcileSelection(
  variants: ProductVariant[],
  attributeKeys: string[],
  prev: Record<string, string>,
  key: string,
  val: string
): Record<string, string> {
  const trial = { ...prev, [key]: val };
  if (findVariant(variants, trial)) return trial;

  const candidates = variants.filter((v) => v[key] === val);
  if (candidates.length === 0) return prev;

  let best = candidates[0];
  let bestScore = -1;
  for (const c of candidates) {
    let score = 0;
    for (const [k, v] of Object.entries(prev)) {
      if (k === key) continue;
      if (c[k] === v) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  const next: Record<string, string> = {};
  for (const k of attributeKeys) {
    const v = best[k];
    if (typeof v === "string") next[k] = v;
  }
  next[key] = val;
  return next;
}
