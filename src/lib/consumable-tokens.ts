// Visual tokens for the consumables catalog configurator.
// Values in the consumables data are stored as human-readable Russian strings
// (e.g. "Белый", "Стерильный"), so display is mostly pass-through. The only
// special rendering is a colour swatch for the `color` attribute.

/** Swatch colour for a Russian colour label. Returns null when unknown so the
 * caller can skip the dot. */
const COLOR_SWATCH_RU: Record<string, string | null> = {
  "Белый": "#f5f5f5",
  "Жёлтый": "#ffd54a",
  "Желтый": "#ffd54a",
  "Голубой": "#3da5d9",
  "Синий": "#1f4a9c",
  "Зелёный": "#3aaf5c",
  "Зеленый": "#3aaf5c",
  "Красный": "#d6463a",
  "Натуральный": "#e8e8e3",
  "Прозрачный": "#e8e8e3",
};

export function colorSwatchRu(value: string | null | undefined): string | null {
  if (!value) return null;
  return COLOR_SWATCH_RU[value] ?? null;
}

/** Attribute keys that should render a colour dot next to the value. */
export const COLOR_ATTR_KEYS = new Set(["color"]);
