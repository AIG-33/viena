// Visual tokens & dictionaries for the vacuum-systems catalog.
// Keep this file UI-agnostic so it can be imported in both server and client components.

import type { Locale } from "@/i18n/routing";

/** ISO-6710 / VACUETTE® cap-colour swatches. */
export const CAP_COLOR_SWATCH: Record<string, string> = {
  blue: "#3da5d9",
  red: "#d6463a",
  green: "#3aaf5c",
  lavender: "#b9a7d6",
  grey: "#a3a3a3",
  gray: "#a3a3a3",
  yellow: "#ffd54a",
  orange: "#ee8639",
  gold: "#d4ad34",
  lightgreen: "#bdde7e",
  "light-green": "#bdde7e",
  white: "#f5f5f5",
  black: "#1f1f1f",
  pink: "#ec9bb6",
  violet: "#7e6bb1",
  turquoise: "#3fc1c9",
  "royal-blue": "#1f4a9c",
  sand: "#d6c69b",
};

export const CAP_COLOR_LABELS: Record<string, Record<Locale, string>> = {
  blue: { ru: "голубой", en: "blue", zh: "蓝色" },
  red: { ru: "красный", en: "red", zh: "红色" },
  green: { ru: "зелёный", en: "green", zh: "绿色" },
  lavender: { ru: "сиреневый", en: "lavender", zh: "淡紫色" },
  grey: { ru: "серый", en: "grey", zh: "灰色" },
  gray: { ru: "серый", en: "gray", zh: "灰色" },
  yellow: { ru: "жёлтый", en: "yellow", zh: "黄色" },
  orange: { ru: "оранжевый", en: "orange", zh: "橙色" },
  gold: { ru: "золотистый", en: "gold", zh: "金色" },
  lightgreen: { ru: "светло-зелёный", en: "light-green", zh: "浅绿色" },
  "light-green": { ru: "светло-зелёный", en: "light-green", zh: "浅绿色" },
  white: { ru: "белый", en: "white", zh: "白色" },
  black: { ru: "чёрный", en: "black", zh: "黑色" },
  pink: { ru: "розовый", en: "pink", zh: "粉色" },
  violet: { ru: "фиолетовый", en: "violet", zh: "紫色" },
  turquoise: { ru: "бирюзовый", en: "turquoise", zh: "青绿色" },
  "royal-blue": { ru: "тёмно-синий", en: "royal blue", zh: "宝蓝色" },
  sand: { ru: "песочный", en: "sand", zh: "沙色" },
};

export function colorLabel(color: string | null | undefined, locale: Locale): string {
  if (!color) return "";
  return CAP_COLOR_LABELS[color]?.[locale] ?? color;
}

export function colorSwatch(color: string | null | undefined): string {
  if (!color) return "transparent";
  return CAP_COLOR_SWATCH[color] ?? "#cccccc";
}

export const SUBCATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  venous: { ru: "Венозная кровь", en: "Venous blood", zh: "静脉采血" },
  capillary: { ru: "Капиллярная кровь", en: "Capillary blood", zh: "毛细血管采血" },
  urine: { ru: "Пробирки для мочи", en: "Urine tubes", zh: "尿液管" },
  esr: { ru: "Штативы СОЭ", en: "ESR racks", zh: "ESR 支架" },
  holder: { ru: "Держатели и иглы", en: "Holders & needles", zh: "支架与针头" },
  tourniquet: { ru: "Жгуты", en: "Tourniquets", zh: "止血带" },
  transport: { ru: "Транспортировка", en: "Transport", zh: "运输" },
  container: { ru: "Контейнеры", en: "Containers", zh: "容器" },
  other: { ru: "Прочее", en: "Other", zh: "其他" },
};

export const ADDITIVE_LABELS: Record<string, Record<Locale, string>> = {
  "esr-citrate-32": { ru: "СОЭ — цитрат 3,2%", en: "ESR — Citrate 3.2%", zh: "ESR — 柠檬酸钠 3.2%" },
  "citrate-32": { ru: "Цитрат натрия 3,2%", en: "Sodium citrate 3.2%", zh: "柠檬酸钠 3.2%" },
  "citrate-38": { ru: "Цитрат натрия 3,8%", en: "Sodium citrate 3.8%", zh: "柠檬酸钠 3.8%" },
  "ctad": { ru: "CTAD-раствор", en: "CTAD solution", zh: "CTAD 溶液" },
  "acd-a": { ru: "ACD-A", en: "ACD-A", zh: "ACD-A" },
  "acd-b": { ru: "ACD-B", en: "ACD-B", zh: "ACD-B" },
  "cpda": { ru: "CPDA", en: "CPDA", zh: "CPDA" },
  "serum-cat": { ru: "Активатор свёртывания (CAT)", en: "Clot activator (CAT)", zh: "凝血活化剂(CAT)" },
  "serum-cat-gel": { ru: "CAT + разделительный гель", en: "CAT + separator gel", zh: "CAT + 分离胶" },
  "serum-cat-fast": { ru: "FAST CAT + гель", en: "FAST CAT + gel", zh: "FAST CAT + 分离胶" },
  "serum-sep": { ru: "Серум + гель (без CAT)", en: "Serum + gel (no CAT)", zh: "血清 + 分离胶(无 CAT)" },
  "crossmatch-serum": { ru: "Crossmatch Serum CAT", en: "Crossmatch Serum CAT", zh: "Crossmatch 血清 CAT" },
  "li-heparin": { ru: "Li-гепарин", en: "Lithium heparin", zh: "锂肝素" },
  "li-heparin-gel": { ru: "Li-гепарин + гель", en: "Lithium heparin + gel", zh: "锂肝素 + 分离胶" },
  "na-heparin": { ru: "Na-гепарин", en: "Sodium heparin", zh: "钠肝素" },
  "li-heparin-iodacetate": { ru: "Li-гепарин / йодацетат", en: "Li-Heparin / iodacetate", zh: "锂肝素 / 碘乙酸盐" },
  "k2edta": { ru: "K2EDTA", en: "K2EDTA", zh: "K2EDTA" },
  "k3edta": { ru: "K3EDTA", en: "K3EDTA", zh: "K3EDTA" },
  "k2edta-gel": { ru: "K2EDTA + гель", en: "K2EDTA + gel", zh: "K2EDTA + 分离胶" },
  "k3edta-gel": { ru: "K3EDTA + гель", en: "K3EDTA + gel", zh: "K3EDTA + 分离胶" },
  "edta-aprotinin": { ru: "EDTA + апротинин", en: "EDTA + aprotinin", zh: "EDTA + 抑肽酶" },
  "crossmatch-k3edta": { ru: "Crossmatch K3EDTA", en: "Crossmatch K3EDTA", zh: "Crossmatch K3EDTA" },
  "fluoride-oxalate": { ru: "NaF / K-оксалат (FX)", en: "FX NaF / K-oxalate", zh: "FX NaF / 草酸钾" },
  "fluoride-edta": { ru: "NaF / K3EDTA (FE)", en: "FE NaF / K3EDTA", zh: "FE NaF / K3EDTA" },
  "fluoride-edta-test": { ru: "FE Glucose Test only", en: "FE Glucose Test only", zh: "FE 葡萄糖检测" },
  "fc-mix": { ru: "FC Mix (цитратный буфер)", en: "FC Mix (citrate buffer)", zh: "FC Mix(柠檬酸缓冲液)" },
  "trace-elements": { ru: "Trace Elements (микроэлементы)", en: "Trace elements", zh: "微量元素" },
  "trace-elements-znf": { ru: "ZNF Trace Elements", en: "ZNF trace elements", zh: "ZNF 微量元素" },
  "no-additive": { ru: "Без добавок (Z)", en: "Z No additive", zh: "Z 无添加剂" },
  "discard": { ru: "Z Discard", en: "Z Discard", zh: "Z 弃用试管" },
  "homocysteine": { ru: "Homocysteine Detection", en: "Homocysteine detection", zh: "同型半胱氨酸检测" },
  "urine": { ru: "Моча — без добавок / стабилизатор", en: "Urine — no additive / stabiliser", zh: "尿液 — 无添加剂 / 稳定剂" },
  "urine-no-additive": { ru: "Без реагентов", en: "No additive", zh: "无添加剂" },
  "urine-csm": { ru: "CCM-среда", en: "CCM medium", zh: "CCM 培养基" },
  "urine-stabilur": { ru: "Stabilur", en: "Stabilur", zh: "Stabilur" },
};

export function additiveLabel(additive: string | null | undefined, locale: Locale): string {
  if (!additive) return "";
  return ADDITIVE_LABELS[additive]?.[locale] ?? additive;
}

export function subcategoryLabel(sub: string, locale: Locale): string {
  return SUBCATEGORY_LABELS[sub]?.[locale] ?? sub;
}

export const CLOSURE_LABELS: Record<string, Record<Locale, string>> = {
  PREMIUM: { ru: "PREMIUM (закручивающаяся)", en: "PREMIUM (screw cap)", zh: "PREMIUM(旋盖)" },
  "non-ridged": { ru: "Без резьбы (с колпачком)", en: "Non-ridged (snap cap)", zh: "无螺纹(卡扣)" },
  sandwich: { ru: "Sandwich-tube", en: "Sandwich tube", zh: "三明治管" },
  sterile: { ru: "Стерилизованная", en: "Sterilised", zh: "已灭菌" },
};

export function closureLabel(closure: string | null | undefined, locale: Locale): string {
  if (!closure) return "";
  return CLOSURE_LABELS[closure]?.[locale] ?? closure;
}

export const MATERIAL_LABELS: Record<string, Record<Locale, string>> = {
  PET: { ru: "PET (пластик)", en: "PET (plastic)", zh: "PET(塑料)" },
  PP: { ru: "PP (полипропилен)", en: "PP (polypropylene)", zh: "PP(聚丙烯)" },
  glass: { ru: "Стекло", en: "Glass", zh: "玻璃" },
};

export function materialLabel(material: string | null | undefined, locale: Locale): string {
  if (!material) return "";
  return MATERIAL_LABELS[material]?.[locale] ?? material;
}

export const LABEL_LABELS: Record<string, Record<Locale, string>> = {
  standard: { ru: "Стандартная", en: "Standard", zh: "标准" },
  "G-barcode": { ru: "G-barcode (штрихкод)", en: "G-barcode label", zh: "G-条码标签" },
  transparent: { ru: "Прозрачная", en: "Transparent", zh: "透明" },
  paper: { ru: "Бумажная", en: "Paper", zh: "纸质" },
  polyester: { ru: "Полиэстер", en: "Polyester", zh: "聚酯" },
};

export function labelLabel(label: string | null | undefined, locale: Locale): string {
  if (!label) return "";
  return LABEL_LABELS[label]?.[locale] ?? label;
}
