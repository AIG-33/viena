import type { Locale } from "@/i18n/routing";

/**
 * Generic locale-merging helper for data objects.
 *
 * Each data entity may carry an optional `i18n` block of the form:
 *
 * ```
 * {
 *   "name": "Russian default",
 *   "i18n": {
 *     "en": { "name": "English override" },
 *     "zh": { "name": "中文覆盖" }
 *   }
 * }
 * ```
 *
 * Calling `applyLocale(item, "en")` returns a flat object with the English
 * overrides shallow-merged on top of the defaults (RU). Missing translations
 * gracefully fall back to the RU values, which keeps the site functional
 * even when a particular field has not been translated yet.
 */
export type Translatable = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  i18n?: Partial<Record<Locale, Record<string, any>>>;
};

export function applyLocale<T extends Translatable>(
  item: T,
  locale: Locale
): Omit<T, "i18n"> {
  if (locale === "ru" || !item.i18n) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { i18n: _drop, ...rest } = item;
    return rest as Omit<T, "i18n">;
  }
  const overrides = item.i18n[locale] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n: _drop, ...rest } = item;
  return { ...rest, ...overrides } as Omit<T, "i18n">;
}

export function applyLocaleAll<T extends Translatable>(
  items: T[],
  locale: Locale
): Omit<T, "i18n">[] {
  return items.map((it) => applyLocale(it, locale));
}
