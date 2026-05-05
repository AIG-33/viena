// Generator for data/products/vacuum-systems.json
// Run: node scripts/build-vacuum-systems.mjs
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// FAMILIES array is filled in by appended chunks below.
const FAMILIES = [];

// === EXPORT ===
function finalize() {
  const out = FAMILIES.map((f, i) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    shortDescription: f.shortDescription,
    description: f.description,
    categoryId: "vacuum-systems",
    subcategory: f.subcategory,
    additive: f.additive ?? null,
    capColor: f.capColor ?? null,
    ringColor: f.ringColor ?? null,
    images: f.images,
    variantAttributes: f.variantAttributes ?? [],
    variants: f.variants,
    specs: f.specs ?? [],
    tags: f.tags ?? [],
    featured: !!f.featured,
    inStock: f.inStock !== false,
    catalogNumber: f.variants[0]?.catalogNumber ?? "",
    manufacturer: f.manufacturer ?? "greiner-bio-one",
    createdAt: "2024-01-01",
    sort: i,
    i18n: f.i18n ?? {},
  }));
  const path = resolve(process.cwd(), "data/products/vacuum-systems.json");
  writeFileSync(path, JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.length} families to ${path}`);
}

// FAMILIES will be pushed below.

const IMG = (slug) => `/images/products/${slug}.webp`;
const IMG_JPG = (slug) => `/images/products/${slug}.jpg`;

// Helper to declare variant attributes uniformly.
const ATTR = {
  closure: { key: "closure", label_ru: "Крышка", label_en: "Closure", label_zh: "封盖" },
  volume: { key: "volume", label_ru: "Объём, мл", label_en: "Volume, ml", label_zh: "容量, 毫升" },
  size: { key: "size", label_ru: "Размер, мм", label_en: "Size, mm", label_zh: "规格, 毫米" },
  capColor: { key: "capColor", label_ru: "Цвет колпачка", label_en: "Cap colour", label_zh: "封盖颜色" },
  ringColor: { key: "ringColor", label_ru: "Цвет кольца", label_en: "Ring colour", label_zh: "环颜色" },
};

// Closure values are localised at render time via dictionary.
const CLOSURE = {
  premium: "PREMIUM",
  nonRidged: "non-ridged",
};

// === COAGULATION: Sodium Citrate 3.2% ===
FAMILIES.push({
  id: "vac-sodium-citrate-32",
  slug: "vacuette-tube-sodium-citrate-32",
  name: "VACUETTE® Пробирка с цитратом натрия 3,2%",
  shortDescription:
    "Пробирка для исследования параметров коагуляции. Буфер цитрата натрия 0,109 моль/л. Соотношение 1:9.",
  description:
    "Пробирки VACUETTE® с цитратом натрия используются для изучения параметров коагуляции. Содержат буферный раствор цитрата натрия 0,109 моль/л (3,2%). Соотношение реагент/кровь — 1:9. Голубой колпачок, кольцо чёрное. Доступны исполнения PREMIUM (безопасная закручивающаяся крышка) и Без резьбы (с крышкой-колпачком).",
  subcategory: "venous",
  additive: "sodium-citrate-32",
  capColor: "blue",
  ringColor: "black",
  images: [IMG("probirka-s-tsitratom-natriya-3-2-premium-bezopasnaya-zakruchivayuschayasya-krysh"), IMG("probirka-s-tsitratom-natriya-3-2-bez-rezby-s-kryshkoi-kolpachkom")],
  featured: true,
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454321", closure: CLOSURE.premium, volume: "2", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454322", closure: CLOSURE.nonRidged, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube Sodium Citrate 3.2%",
      shortDescription: "Coagulation tube. 0.109 mol/l sodium citrate buffer, 1:9 ratio.",
      description: "VACUETTE® Tubes with sodium citrate are used for coagulation studies. Buffered with 0.109 mol/l (3.2%) sodium citrate at a 1:9 reagent-to-blood ratio. Blue cap, black ring. Available with PREMIUM safety screw cap or non-ridged with snap cap.",
    },
    zh: {
      name: "VACUETTE® 试管 柠檬酸钠 3.2%",
      shortDescription: "凝血检测管,0.109 mol/L 柠檬酸钠缓冲液,1:9 比例。",
      description: "VACUETTE® 柠檬酸钠试管用于凝血参数检测,含 0.109 mol/L (3.2%) 柠檬酸钠缓冲液,试剂与血液比例 1:9。蓝色封盖,黑色环,提供 PREMIUM 安全旋盖与无螺纹两种规格。",
    },
  },
});

// === COAGULATION: Sodium Citrate 3.8% ===
FAMILIES.push({
  id: "vac-sodium-citrate-38",
  slug: "vacuette-tube-sodium-citrate-38",
  name: "VACUETTE® Пробирка с цитратом натрия 3,8%",
  shortDescription: "Пробирка для исследования параметров коагуляции. Буфер цитрата натрия 0,129 моль/л. Соотношение 1:9.",
  description: "Пробирки VACUETTE® с цитратом натрия 3,8%. Буферный раствор 0,129 моль/л обеспечивает корректное соотношение реагент/кровь 1:9. Голубой колпачок, кольцо чёрное. Доступны PREMIUM 13×75 и Без резьбы 16×100.",
  subcategory: "venous",
  additive: "sodium-citrate-38",
  capColor: "blue",
  ringColor: "black",
  images: [IMG("probirka-s-tsitratom-natriya-3-8-premium-bezopasnaya-zakruchivayuschayasya-krysh"), IMG("probirka-s-tsitratom-natriya-3-8-bez-rezby-s-kryshkoi-kolpachkom")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454381", closure: CLOSURE.premium, volume: "2", size: "13×75", pack: "50/1200" },
    { catalogNumber: "455382", closure: CLOSURE.nonRidged, volume: "9", size: "16×100", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube Sodium Citrate 3.8%",
      shortDescription: "Coagulation tube. 0.129 mol/l sodium citrate buffer, 1:9 ratio.",
      description: "VACUETTE® Tubes with 0.129 mol/l (3.8%) sodium citrate buffer for coagulation studies. Reagent-to-blood ratio 1:9. Blue cap, black ring. Available in PREMIUM 13×75 and non-ridged 16×100 formats.",
    },
    zh: {
      name: "VACUETTE® 试管 柠檬酸钠 3.8%",
      shortDescription: "凝血检测管,0.129 mol/L 柠檬酸钠缓冲液,1:9 比例。",
      description: "VACUETTE® 含 0.129 mol/L (3.8%) 柠檬酸钠缓冲液的凝血试管,试剂与血液比例 1:9。蓝色封盖、黑色环。提供 PREMIUM 13×75 与无螺纹 16×100 两种规格。",
    },
  },
});

// === COAGULATION: CTAD ===
FAMILIES.push({
  id: "vac-ctad",
  slug: "vacuette-tube-ctad",
  name: "VACUETTE® Пробирка с CTAD-раствором",
  shortDescription: "Цитрат + теофиллин, аденозин, дипиридамол. Стабилизация тромбоцитов для исследований коагуляции.",
  description: "Пробирки VACUETTE® с CTAD-раствором — это буфер цитрата натрия 3,2%, дополненный теофиллином, аденозином и дипиридамолом. Используются для специальных коагулологических исследований и стабилизации тромбоцитов. Голубой колпачок, жёлтое кольцо, PREMIUM, 13×75.",
  subcategory: "venous",
  additive: "ctad",
  capColor: "blue",
  ringColor: "yellow",
  images: [IMG("probirka-s-ctad-rastvorom-premium-bezopasnaya-zakruchivayuschayasya-kryshka")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "474065", closure: CLOSURE.premium, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube CTAD",
      shortDescription: "Citrate + theophylline, adenosine, dipyridamole. Platelet stabilisation for coagulation studies.",
      description: "VACUETTE® CTAD Tubes contain 3.2% sodium citrate buffer with added theophylline, adenosine and dipyridamole. Used for advanced coagulation studies that require platelet stabilisation. Blue cap, yellow ring, PREMIUM, 13×75.",
    },
    zh: {
      name: "VACUETTE® 试管 CTAD 溶液",
      shortDescription: "柠檬酸盐 + 茶碱、腺苷、双嘧达莫。用于凝血研究中的血小板稳定。",
      description: "VACUETTE® CTAD 试管含 3.2% 柠檬酸钠缓冲液,加入茶碱、腺苷和双嘧达莫,用于需稳定血小板的高级凝血研究。蓝色封盖、黄色环、PREMIUM,13×75。",
    },
  },
});

// === SERUM CAT (Clot Activator) ===
FAMILIES.push({
  id: "vac-serum-cat",
  slug: "vacuette-tube-serum-cat",
  name: "VACUETTE® Пробирка с активатором образования сгустка (Serum CAT)",
  shortDescription: "Получение сыворотки. Активатор свёртывания на стенках пробирки. Красный колпачок.",
  description: "Пробирки VACUETTE® Serum CAT с активатором образования сгустка предназначены для получения сыворотки крови. Активатор нанесён на внутреннюю стенку пробирки. Красный колпачок. Доступны PREMIUM (безопасная закручивающаяся крышка) и Без резьбы (с крышкой-колпачком).",
  subcategory: "venous",
  additive: "serum-cat",
  capColor: "red",
  ringColor: "black",
  images: [IMG("probirka-s-aktivatorom-obrazovaniya-sgustka-premium-bezopasnaya-zakruchivayuscha"), IMG("probirka-s-aktivatorom-obrazovaniya-sgustka-bez-rezby-s-kryshkoi-kolpachkom")],
  featured: true,
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454098", closure: CLOSURE.premium, volume: "1", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454236", closure: CLOSURE.nonRidged, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube CAT Serum (Clot Activator)",
      shortDescription: "Serum tube with clot activator on the inner wall. Red cap.",
      description: "VACUETTE® CAT Serum Tubes contain a clot activator coated on the inner wall of the tube and are used for serum preparation. Red cap. Available with PREMIUM safety screw cap or non-ridged with snap cap.",
    },
    zh: {
      name: "VACUETTE® 试管 CAT 血清(凝血活化剂)",
      shortDescription: "血清管,内壁涂覆凝血活化剂,红色封盖。",
      description: "VACUETTE® CAT 血清管在内壁涂有凝血活化剂,用于血清制备。红色封盖。提供 PREMIUM 安全旋盖与无螺纹两种规格。",
    },
  },
});

// === SERUM CAT + GEL (Serum Separator) ===
FAMILIES.push({
  id: "vac-serum-cat-gel",
  slug: "vacuette-tube-serum-cat-gel",
  name: "VACUETTE® Пробирка с активатором образования сгустка и гелем",
  shortDescription: "Сыворотка с разделительным гелем. Красный колпачок, жёлтое кольцо.",
  description: "Пробирки VACUETTE® Serum Separator с активатором свёртывания и инертным разделительным гелем. После центрифугирования гель образует устойчивый барьер между сывороткой и форменными элементами. Красный колпачок, жёлтое кольцо.",
  subcategory: "venous",
  additive: "serum-cat-gel",
  capColor: "red",
  ringColor: "yellow",
  images: [IMG("probirka-s-aktivatorom-obrazovaniya-sgustka-i-gelem-premium-bezopasnaya-zakruchi"), IMG("probirka-s-aktivatorom-obrazovaniya-sgustka-i-gelem-bez-rezby-s-kryshkoi-kolpach")],
  featured: true,
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454028", closure: CLOSURE.premium, volume: "3.5", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454243", closure: CLOSURE.nonRidged, volume: "3.5", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube CAT Serum + Separator Gel",
      shortDescription: "Serum tube with clot activator and inert separator gel. Red cap, yellow ring.",
      description: "VACUETTE® Serum Separator Tubes combine a clot activator with an inert separator gel. After centrifugation the gel forms a stable barrier between serum and cellular components. Red cap, yellow ring.",
    },
    zh: {
      name: "VACUETTE® 试管 CAT 血清 + 分离胶",
      shortDescription: "含凝血活化剂与惰性分离胶的血清管。红色封盖、黄色环。",
      description: "VACUETTE® 血清分离管结合凝血活化剂与惰性分离胶,离心后在血清与有形成分之间形成稳定屏障。红色封盖、黄色环。",
    },
  },
});

// === FAST SERUM CAT + GEL (rapid clotting) ===
FAMILIES.push({
  id: "vac-fast-serum-cat-gel",
  slug: "vacuette-tube-fast-serum-cat-gel",
  name: "VACUETTE® FAST Пробирка с ускоренным активатором свёртывания и гелем",
  shortDescription: "Ускоренное образование сгустка ~5 минут. Оранжевый колпачок, жёлтое кольцо.",
  description: "Пробирки VACUETTE® FAST содержат активатор ускоренного свёртывания, что позволяет получить сыворотку примерно за 5 минут вместо стандартных 30. Дополнительно — разделительный гель. Оранжевый колпачок, жёлтое кольцо.",
  subcategory: "venous",
  additive: "fast-serum-cat-gel",
  capColor: "orange",
  ringColor: "yellow",
  images: [IMG("probirka-s-s-aktivatorom-uskorennogo-obrazovaniya-sgustka-i-gelem-bez-rezby-s-kr")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454593", closure: CLOSURE.nonRidged, volume: "3.5", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® FAST Tube Rapid Clot Activator + Gel",
      shortDescription: "Fast clotting in ~5 minutes. Orange cap, yellow ring.",
      description: "VACUETTE® FAST tubes contain a rapid clot activator that produces serum in about 5 minutes versus the standard 30, paired with a separator gel. Orange cap, yellow ring.",
    },
    zh: {
      name: "VACUETTE® FAST 快速凝血 + 分离胶试管",
      shortDescription: "约 5 分钟即可凝血。橙色封盖、黄色环。",
      description: "VACUETTE® FAST 试管含快速凝血活化剂,可在约 5 分钟内分离血清(常规为 30 分钟),并配有分离胶。橙色封盖、黄色环。",
    },
  },
});

// === HEPARIN: Lithium Heparin ===
FAMILIES.push({
  id: "vac-li-heparin",
  slug: "vacuette-tube-lithium-heparin",
  name: "VACUETTE® Пробирка с Li-гепарином",
  shortDescription: "Литий-гепарин для биохимии плазмы. Зелёный колпачок.",
  description: "Пробирки VACUETTE® с Li-гепарином (литий-гепарин нанесён на стенку пробирки) — антикоагулянт для биохимических и иммунохимических исследований плазмы. Зелёный колпачок. Доступны PREMIUM и Без резьбы.",
  subcategory: "venous",
  additive: "li-heparin",
  capColor: "green",
  ringColor: "black",
  images: [IMG("probirka-s-li-geparinom-premium-bezopasnaya-zakruchivayuschayasya-kryshka"), IMG("probirka-s-li-geparinom-bez-rezby-s-kryshkoi-kolpachkom"), IMG("probirka-s-li-geparinom")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454081", closure: CLOSURE.premium, volume: "1", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454237", closure: CLOSURE.nonRidged, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube Lithium Heparin",
      shortDescription: "Lithium heparin for plasma chemistry. Green cap.",
      description: "VACUETTE® Lithium Heparin Tubes contain heparin spray-coated on the inner wall and are used for plasma chemistry and immunoassays. Green cap. Available in PREMIUM and non-ridged formats.",
    },
    zh: {
      name: "VACUETTE® 试管 锂肝素",
      shortDescription: "锂肝素血浆生化检测管。绿色封盖。",
      description: "VACUETTE® 锂肝素试管的内壁喷涂肝素,用于血浆生化与免疫检测。绿色封盖。提供 PREMIUM 与无螺纹两种规格。",
    },
  },
});

// === HEPARIN: Lithium Heparin + Gel ===
FAMILIES.push({
  id: "vac-li-heparin-gel",
  slug: "vacuette-tube-lithium-heparin-gel",
  name: "VACUETTE® Пробирка с Li-гепарином и гелем",
  shortDescription: "Литий-гепарин с разделительным гелем. Зелёный колпачок, жёлтое кольцо.",
  description: "Пробирки VACUETTE® Plasma Separator с Li-гепарином и инертным разделительным гелем — для биохимических исследований плазмы. После центрифугирования гель формирует барьер между плазмой и форменными элементами. Зелёный колпачок, жёлтое кольцо.",
  subcategory: "venous",
  additive: "li-heparin-gel",
  capColor: "green",
  ringColor: "yellow",
  images: [IMG("probirka-s-li-geparinom-i-gelem-premium-bezopasnaya-zakruchivayuschayasya-kryshk"), IMG("probirka-s-li-geparinom-i-gelem-bez-rezby-s-kryshkoi-kolpachkom")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454083", closure: CLOSURE.premium, volume: "3", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454008", closure: CLOSURE.nonRidged, volume: "3", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube Lithium Heparin + Separator Gel",
      shortDescription: "Lithium heparin with inert separator gel. Green cap, yellow ring.",
      description: "VACUETTE® Plasma Separator Tubes combine lithium heparin with an inert separator gel for plasma chemistry. After centrifugation the gel creates a stable barrier between plasma and cellular components. Green cap, yellow ring.",
    },
    zh: {
      name: "VACUETTE® 试管 锂肝素 + 分离胶",
      shortDescription: "锂肝素加分离胶。绿色封盖、黄色环。",
      description: "VACUETTE® 血浆分离管结合锂肝素与惰性分离胶,适用于血浆生化检测。离心后形成稳定屏障。绿色封盖、黄色环。",
    },
  },
});

// === HEPARIN: Sodium Heparin ===
FAMILIES.push({
  id: "vac-na-heparin",
  slug: "vacuette-tube-sodium-heparin",
  name: "VACUETTE® Пробирка с Na-гепарином",
  shortDescription: "Натрий-гепарин. Зелёный колпачок, зелёное кольцо.",
  description: "Пробирки VACUETTE® с Na-гепарином (натрий-гепарин) — антикоагулянт для специальных исследований плазмы и определения микроэлементов. Зелёный колпачок, зелёное кольцо.",
  subcategory: "venous",
  additive: "na-heparin",
  capColor: "green",
  ringColor: "green",
  images: [IMG("probirka-s-na-geparinom-premium-bezopasnaya-zakruchivayuschayasya-kryshka"), IMG("probirka-s-na-geparinom-bez-rezby-s-kryshkoi-kolpachkom")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "484531", closure: CLOSURE.premium, volume: "4", size: "13×75", pack: "50/1200" },
    { catalogNumber: "455051", closure: CLOSURE.nonRidged, volume: "9", size: "16×100", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube Sodium Heparin",
      shortDescription: "Sodium heparin. Green cap, green ring.",
      description: "VACUETTE® Sodium Heparin Tubes contain Na-heparin and are used for specialised plasma analyses and trace-element measurements. Green cap, green ring.",
    },
    zh: {
      name: "VACUETTE® 试管 钠肝素",
      shortDescription: "钠肝素。绿色封盖、绿色环。",
      description: "VACUETTE® 钠肝素试管含 Na 肝素,用于特殊血浆分析与微量元素检测。绿色封盖、绿色环。",
    },
  },
});

// === EDTA: K2EDTA ===
FAMILIES.push({
  id: "vac-k2edta",
  slug: "vacuette-tube-k2edta",
  name: "VACUETTE® Пробирка с K2EDTA",
  shortDescription: "Гематология (CBC), HbA1c. Дикалиевая соль ЭДТА. Сиреневый колпачок.",
  description: "Пробирки VACUETTE® с K2EDTA (дикалиевая соль этилендиаминтетрауксусной кислоты) — антикоагулянт для гематологических исследований цельной крови (общий анализ, HbA1c). Сиреневый колпачок. Доступны PREMIUM и Без резьбы.",
  subcategory: "venous",
  additive: "k2edta",
  capColor: "lavender",
  ringColor: "white",
  images: [IMG_JPG("probirka-s-k2edta-premium-bezopasnaya-zakruchivayuschayasya-kryshka"), IMG("probirka-s-k2edta-bez-rezby-s-kryshkoi-kolpachkom"), IMG("probirka-s-k2-edta-2"), IMG_JPG("probirka-s-k2-edta")],
  featured: true,
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454024", closure: CLOSURE.premium, volume: "2", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454047", closure: CLOSURE.nonRidged, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube K2EDTA",
      shortDescription: "Haematology (CBC), HbA1c. Dipotassium EDTA. Lavender cap.",
      description: "VACUETTE® K2EDTA Tubes contain spray-dried dipotassium EDTA — anticoagulant for whole-blood haematology (CBC, HbA1c). Lavender cap. Available in PREMIUM and non-ridged formats.",
    },
    zh: {
      name: "VACUETTE® 试管 K2EDTA",
      shortDescription: "血液学(CBC)、HbA1c。二钾 EDTA。淡紫色封盖。",
      description: "VACUETTE® K2EDTA 试管喷涂二钾 EDTA,用于全血血液学(CBC、HbA1c)。淡紫色封盖。提供 PREMIUM 与无螺纹两种规格。",
    },
  },
});

// === EDTA: K3EDTA ===
FAMILIES.push({
  id: "vac-k3edta",
  slug: "vacuette-tube-k3edta",
  name: "VACUETTE® Пробирка с K3EDTA",
  shortDescription: "Гематология. Трикалиевая соль ЭДТА в жидкой форме. Сиреневый колпачок.",
  description: "Пробирки VACUETTE® с K3EDTA (трикалиевая соль ЭДТА в жидкой форме) — антикоагулянт для гематологии. Сиреневый колпачок. Доступны PREMIUM и Без резьбы.",
  subcategory: "venous",
  additive: "k3edta",
  capColor: "lavender",
  ringColor: "white",
  images: [IMG("probirka-s-k3edta-premium-bezopasnaya-zakruchivayuschayasya-kryshka"), IMG("probirka-s-k3edta-bez-rezby-s-kryshkoi-kolpachkom"), IMG("probirka-s-k3-edta"), IMG("probirka-s-k3-edta-2"), IMG("probirka-s-k3-edta-3")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "484509", closure: CLOSURE.premium, volume: "2", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454222", closure: CLOSURE.nonRidged, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube K3EDTA",
      shortDescription: "Haematology. Liquid tripotassium EDTA. Lavender cap.",
      description: "VACUETTE® K3EDTA Tubes contain liquid tripotassium EDTA for whole-blood haematology. Lavender cap. Available in PREMIUM and non-ridged formats.",
    },
    zh: {
      name: "VACUETTE® 试管 K3EDTA",
      shortDescription: "血液学检测。液态三钾 EDTA。淡紫色封盖。",
      description: "VACUETTE® K3EDTA 试管含液态三钾 EDTA,用于全血血液学。淡紫色封盖。提供 PREMIUM 与无螺纹两种规格。",
    },
  },
});

// === EDTA: K2EDTA + Gel ===
FAMILIES.push({
  id: "vac-k2edta-gel",
  slug: "vacuette-tube-k2edta-gel",
  name: "VACUETTE® Пробирка с K2EDTA и гелем",
  shortDescription: "Молекулярная диагностика. K2EDTA + разделительный гель.",
  description: "Пробирки VACUETTE® с K2EDTA и инертным разделительным гелем — для подготовки плазмы под молекулярные тесты. Сиреневый колпачок, жёлтое кольцо.",
  subcategory: "venous",
  additive: "k2edta-gel",
  capColor: "lavender",
  ringColor: "yellow",
  images: [IMG("probirka-s-k2edta-i-gelem-premium-bezopasnaya-zakruchivayuschayasya-kryshka"), IMG("probirka-s-k2edta-i-gelem-bez-rezby-s-kryshkoi-kolpachkom")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "454235", closure: CLOSURE.premium, volume: "3", size: "13×75", pack: "50/1200" },
    { catalogNumber: "456058", closure: CLOSURE.nonRidged, volume: "5", size: "13×100", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube K2EDTA + Separator Gel",
      shortDescription: "Molecular diagnostics. K2EDTA with separator gel.",
      description: "VACUETTE® Tubes with K2EDTA and inert separator gel — used to prepare plasma for molecular testing. Lavender cap, yellow ring.",
    },
    zh: {
      name: "VACUETTE® 试管 K2EDTA + 分离胶",
      shortDescription: "分子诊断。K2EDTA 加分离胶。",
      description: "VACUETTE® K2EDTA 加惰性分离胶试管,用于制备分子检测的血浆样本。淡紫色封盖、黄色环。",
    },
  },
});

// === GLUCOSE: NaF / K-oxalate (FX) ===
FAMILIES.push({
  id: "vac-fluoride-oxalate",
  slug: "vacuette-tube-fluoride-oxalate",
  name: "VACUETTE® Пробирка с Na фторидом / K оксалатом",
  shortDescription: "Глюкоза, лактат. NaF + K оксалат. Серый колпачок.",
  description: "Пробирки VACUETTE® с фторидом натрия и оксалатом калия (FX) — ингибитор гликолиза + антикоагулянт. Стандарт для определения глюкозы и лактата. Серый колпачок.",
  subcategory: "venous",
  additive: "fluoride-oxalate",
  capColor: "grey",
  ringColor: "white",
  images: [IMG("probirka-s-na-ftoridom-k-oksalatom"), IMG("probirka-s-na-ftoridom-k-oksalatom-bez-rezby-s-kryshkoi-kolpachkom"), IMG("probirka-s-na-ftoridom-k-oksalatom-2")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "484528", closure: CLOSURE.nonRidged, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube FX Sodium Fluoride / Potassium Oxalate",
      shortDescription: "Glucose, lactate. NaF + K oxalate. Grey cap.",
      description: "VACUETTE® FX Tubes contain sodium fluoride (glycolysis inhibitor) and potassium oxalate (anticoagulant) — the reference combination for glucose and lactate testing. Grey cap.",
    },
    zh: {
      name: "VACUETTE® 试管 FX 氟化钠 / 草酸钾",
      shortDescription: "葡萄糖、乳酸检测。NaF + 草酸钾。灰色封盖。",
      description: "VACUETTE® FX 试管含氟化钠(糖酵解抑制剂)与草酸钾(抗凝剂),是葡萄糖与乳酸检测的标准组合。灰色封盖。",
    },
  },
});

// === GLUCOSE: NaF / K3EDTA (FE) ===
FAMILIES.push({
  id: "vac-fluoride-edta",
  slug: "vacuette-tube-fluoride-edta",
  name: "VACUETTE® Пробирка с Na фторидом / K3EDTA",
  shortDescription: "Глюкоза. NaF + K3EDTA. Серый колпачок, белое кольцо.",
  description: "Пробирки VACUETTE® FE с фторидом натрия и K3EDTA — комбинация ингибитора гликолиза и стабильного антикоагулянта для точного определения глюкозы. Серый колпачок, белое кольцо.",
  subcategory: "venous",
  additive: "fluoride-edta",
  capColor: "grey",
  ringColor: "white",
  images: [IMG("probirka-s-na-ftoridom-k3edta-premium-bezopasnaya-zakruchivayuschayasya-kryshka"), IMG("probirka-s-na-ftoridom-k3edta-bez-rezby-s-kryshkoi-kolpachkom")],
  variantAttributes: [ATTR.closure, ATTR.volume, ATTR.size],
  variants: [
    { catalogNumber: "484520", closure: CLOSURE.premium, volume: "2", size: "13×75", pack: "50/1200" },
    { catalogNumber: "454221", closure: CLOSURE.nonRidged, volume: "2", size: "13×75", pack: "50/1200" },
  ],
  i18n: {
    en: {
      name: "VACUETTE® Tube FE Sodium Fluoride / K3EDTA",
      shortDescription: "Glucose. NaF + K3EDTA. Grey cap, white ring.",
      description: "VACUETTE® FE Tubes contain sodium fluoride and K3EDTA — a glycolysis inhibitor with a stable anticoagulant for accurate glucose measurement. Grey cap, white ring.",
    },
    zh: {
      name: "VACUETTE® 试管 FE 氟化钠 / K3EDTA",
      shortDescription: "葡萄糖检测。NaF + K3EDTA。灰色封盖、白色环。",
      description: "VACUETTE® FE 试管含氟化钠与 K3EDTA,作为糖酵解抑制剂与稳定抗凝剂的组合,用于葡萄糖精准测定。灰色封盖、白色环。",
    },
  },
});

// =================================================================
// CAPILLARY BLOOD — MiniCollect® tubes (для капиллярной крови)
// =================================================================

// === MiniCollect Sodium Citrate 3.2% ===
FAMILIES.push({
  id: "mc-sodium-citrate",
  slug: "minicollect-tube-sodium-citrate-32",
  name: "MiniCollect® Пробирка с цитратом натрия 3,2%",
  shortDescription: "Капиллярная коагулология у детей. Голубой колпачок.",
  description: "Пробирки MiniCollect® с цитратом натрия 3,2% — для коагулологических исследований из капиллярной крови. Голубой колпачок. Идеально для педиатрии и сложных венозных доступов.",
  subcategory: "capillary",
  additive: "sodium-citrate-32",
  capColor: "blue",
  ringColor: null,
  images: [IMG("probirka-s-tsitratom-natriya-3-2")],
  variantAttributes: [ATTR.volume],
  variants: [
    { catalogNumber: "450539", volume: "1", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube Sodium Citrate 3.2%", shortDescription: "Capillary coagulation in paediatrics. Blue cap.", description: "MiniCollect® Tubes with 3.2% sodium citrate for coagulation testing from capillary blood. Blue cap. Ideal for paediatrics and difficult venous access." },
    zh: { name: "MiniCollect® 试管 柠檬酸钠 3.2%", shortDescription: "毛细血管凝血(儿科)。蓝色封盖。", description: "MiniCollect® 含 3.2% 柠檬酸钠的试管,用于毛细血管血凝血检测,适合儿科与采血困难者。蓝色封盖。" },
  },
});

// === MiniCollect Serum (Clot Activator) ===
FAMILIES.push({
  id: "mc-serum",
  slug: "minicollect-tube-serum",
  name: "MiniCollect® Пробирка с активатором свёртывания",
  shortDescription: "Сыворотка из капиллярной крови. Красный колпачок.",
  description: "Пробирки MiniCollect® с активатором свёртывания — для получения сыворотки из небольших объёмов капиллярной крови. Красный колпачок.",
  subcategory: "capillary",
  additive: "serum-cat",
  capColor: "red",
  ringColor: null,
  images: [IMG("probirka-s-aktivatorom-svertyvaniya")],
  variantAttributes: [ATTR.volume],
  variants: [
    { catalogNumber: "450534", volume: "0.5–1", pack: "2000/box" },
    { catalogNumber: "450549", volume: "0.5–1.0", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube Serum (Clot Activator)", shortDescription: "Serum from capillary blood. Red cap.", description: "MiniCollect® Tubes with a clot activator for serum preparation from small capillary samples. Red cap." },
    zh: { name: "MiniCollect® 试管 凝血活化剂", shortDescription: "毛细血管血清制备。红色封盖。", description: "MiniCollect® 含凝血活化剂的试管,用于从少量毛细血管血制备血清。红色封盖。" },
  },
});

// === MiniCollect Serum + Gel ===
FAMILIES.push({
  id: "mc-serum-gel",
  slug: "minicollect-tube-serum-gel",
  name: "MiniCollect® Пробирка с активатором свёртывания и разделительным гелем",
  shortDescription: "Сыворотка с гелем из капиллярной крови. Золотистый колпачок.",
  description: "Пробирки MiniCollect® с активатором свёртывания и разделительным гелем — упрощённая работа с сывороткой из капиллярной крови. Золотистый колпачок.",
  subcategory: "capillary",
  additive: "serum-cat-gel",
  capColor: "gold",
  ringColor: null,
  images: [IMG("probirka-s-aktivatorom-svertyvaniya-i-razdelitelnym-gelem"), IMG("probirka-dlya-polucheniya-syvorotki-s-aktivatorom-svertyvaniya"), IMG("probirka-dlya-polucheniya-syvorotki-s-razdelitelnym-gelem")],
  variantAttributes: [ATTR.volume],
  variants: [
    { catalogNumber: "450533", volume: "0.5–0.8", pack: "2000/box" },
    { catalogNumber: "450548", volume: "0.5–0.8", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube Serum + Separator Gel", shortDescription: "Serum + gel from capillary blood. Gold cap.", description: "MiniCollect® Tubes with a clot activator and separator gel — simplified serum work-up from capillary blood. Gold cap." },
    zh: { name: "MiniCollect® 试管 凝血活化剂 + 分离胶", shortDescription: "毛细血管血清加分离胶。金色封盖。", description: "MiniCollect® 含凝血活化剂与分离胶的试管,简化毛细血管血清的制备流程。金色封盖。" },
  },
});

// === MiniCollect Lithium Heparin ===
FAMILIES.push({
  id: "mc-li-heparin",
  slug: "minicollect-tube-lithium-heparin",
  name: "MiniCollect® Пробирка с Li-гепарином",
  shortDescription: "Биохимия плазмы из капиллярной крови. Зелёный колпачок.",
  description: "Пробирки MiniCollect® с Li-гепарином — для биохимических исследований плазмы из капиллярной крови. Зелёный колпачок.",
  subcategory: "capillary",
  additive: "li-heparin",
  capColor: "green",
  ringColor: null,
  images: [IMG("probirka-s-li-geparinom-2")],
  variantAttributes: [ATTR.volume],
  variants: [
    { catalogNumber: "450536", volume: "0.5–0.8", pack: "2000/box" },
    { catalogNumber: "450550", volume: "0.8", pack: "2000/box" },
    { catalogNumber: "450551", volume: "1", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube Lithium Heparin", shortDescription: "Plasma chemistry from capillary blood. Green cap.", description: "MiniCollect® Tubes with lithium heparin for plasma chemistry from capillary blood. Green cap." },
    zh: { name: "MiniCollect® 试管 锂肝素", shortDescription: "毛细血管血浆生化。绿色封盖。", description: "MiniCollect® 锂肝素试管,用于毛细血管血的血浆生化检测。绿色封盖。" },
  },
});

// === MiniCollect Lithium Heparin + Gel ===
FAMILIES.push({
  id: "mc-li-heparin-gel",
  slug: "minicollect-tube-lithium-heparin-gel",
  name: "MiniCollect® Пробирка с Li-гепарином и гелем",
  shortDescription: "Плазма с разделительным гелем. Светло-зелёный колпачок.",
  description: "Пробирки MiniCollect® с Li-гепарином и инертным разделительным гелем — для биохимии плазмы из капиллярной крови. Светло-зелёный колпачок.",
  subcategory: "capillary",
  additive: "li-heparin-gel",
  capColor: "lightgreen",
  ringColor: null,
  images: [IMG("probirka-s-li-geparinom-i-razdelitelnym-gelem")],
  variantAttributes: [],
  variants: [
    { catalogNumber: "450535", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube Lithium Heparin + Gel", shortDescription: "Plasma with separator gel. Light-green cap.", description: "MiniCollect® Tubes with lithium heparin and an inert separator gel — capillary plasma chemistry. Light-green cap." },
    zh: { name: "MiniCollect® 试管 锂肝素 + 分离胶", shortDescription: "血浆加分离胶。浅绿色封盖。", description: "MiniCollect® 锂肝素加惰性分离胶试管,用于毛细血管血浆生化。浅绿色封盖。" },
  },
});

// === MiniCollect K3EDTA ===
FAMILIES.push({
  id: "mc-k3edta",
  slug: "minicollect-tube-k3edta",
  name: "MiniCollect® Пробирка с К3 ЭДТА",
  shortDescription: "Гематология из капиллярной крови. Сиреневый колпачок.",
  description: "Пробирки MiniCollect® с К3 ЭДТА — для гематологических исследований из капиллярной крови (CBC). Сиреневый колпачок. Доступны несколько объёмов и исполнение с прозрачной этикеткой.",
  subcategory: "capillary",
  additive: "k3edta",
  capColor: "lavender",
  ringColor: null,
  images: [IMG("probirka-s-k3-edta-prozrachnaya-etiketka")],
  variantAttributes: [ATTR.volume],
  variants: [
    { catalogNumber: "450530", volume: "0.5", pack: "2000/box" },
    { catalogNumber: "450545", volume: "0.25–0.5", pack: "2000/box" },
    { catalogNumber: "480546", volume: "0.25–0.5", pack: "2000/box", note: "transparent label" },
    { catalogNumber: "450546", volume: "1", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube K3EDTA", shortDescription: "Capillary haematology. Lavender cap.", description: "MiniCollect® Tubes with K3EDTA for capillary haematology (CBC). Lavender cap. Multiple fill volumes; transparent-label option available." },
    zh: { name: "MiniCollect® 试管 K3EDTA", shortDescription: "毛细血管血液学(CBC)。淡紫色封盖。", description: "MiniCollect® K3EDTA 试管,用于毛细血管血液学检测(CBC)。淡紫色封盖,提供多种容量与透明标签型号。" },
  },
});

// === MiniCollect K2EDTA ===
FAMILIES.push({
  id: "mc-k2edta",
  slug: "minicollect-tube-k2edta",
  name: "MiniCollect® Пробирка с К2 ЭДТА",
  shortDescription: "Гематология из капиллярной крови. Сиреневый колпачок.",
  description: "Пробирки MiniCollect® с К2 ЭДТА — гематология из капиллярной крови. Сиреневый колпачок.",
  subcategory: "capillary",
  additive: "k2edta",
  capColor: "lavender",
  ringColor: null,
  images: [IMG("probirka-s-k2-edta-2")],
  variantAttributes: [ATTR.volume],
  variants: [
    { catalogNumber: "450532", volume: "0.25–0.5", pack: "2000/box" },
    { catalogNumber: "450547", volume: "0.25–0.5", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube K2EDTA", shortDescription: "Capillary haematology. Lavender cap.", description: "MiniCollect® Tubes with K2EDTA for capillary haematology. Lavender cap." },
    zh: { name: "MiniCollect® 试管 K2EDTA", shortDescription: "毛细血管血液学。淡紫色封盖。", description: "MiniCollect® K2EDTA 试管,用于毛细血管血液学。淡紫色封盖。" },
  },
});

// === MiniCollect NaF / K-oxalate (Glucose) ===
FAMILIES.push({
  id: "mc-fluoride-oxalate",
  slug: "minicollect-tube-fluoride-oxalate",
  name: "MiniCollect® Пробирка с Na фторидом / K оксалатом",
  shortDescription: "Глюкоза из капиллярной крови. Серый колпачок.",
  description: "Пробирки MiniCollect® с фторидом натрия и оксалатом калия — определение глюкозы из капиллярной крови. Серый колпачок.",
  subcategory: "capillary",
  additive: "fluoride-oxalate",
  capColor: "grey",
  ringColor: null,
  images: [IMG("probirka-s-na-ftoridom-k-oksalatom-2")],
  variantAttributes: [ATTR.volume],
  variants: [
    { catalogNumber: "450540", volume: "0.25", pack: "2000/box" },
    { catalogNumber: "450552", volume: "0.25", pack: "2000/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube NaF / K Oxalate", shortDescription: "Capillary glucose. Grey cap.", description: "MiniCollect® Tubes with sodium fluoride and potassium oxalate for capillary glucose testing. Grey cap." },
    zh: { name: "MiniCollect® 试管 NaF / 草酸钾", shortDescription: "毛细血管葡萄糖检测。灰色封盖。", description: "MiniCollect® 含氟化钠与草酸钾的试管,用于毛细血管葡萄糖检测。灰色封盖。" },
  },
});

// === MiniCollect tube holder ===
FAMILIES.push({
  id: "mc-holder",
  slug: "minicollect-tube-holder-13x75",
  name: "Держатель пробирок MiniCollect® 13×75",
  shortDescription: "Адаптер MiniCollect® под штатив 13×75.",
  description: "Держатель пробирок MiniCollect® под стандартный штатив 13×75 мм. Используется при центрифугировании и хранении капиллярных пробирок.",
  subcategory: "capillary",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [IMG("derzhatel-probirok-minicollect-13-75-mm")],
  variantAttributes: [],
  variants: [
    { catalogNumber: "450417", pack: "500/box" },
  ],
  i18n: {
    en: { name: "MiniCollect® Tube Holder 13×75", shortDescription: "Adapter for 13×75 racks.", description: "Adapter that lets MiniCollect® tubes fit standard 13×75 racks for centrifugation and storage." },
    zh: { name: "MiniCollect® 试管支架 13×75", shortDescription: "13×75 试管架适配器。", description: "MiniCollect® 试管的标准 13×75 架适配器,用于离心与存储。" },
  },
});

// =================================================================
// URINE TUBES
// =================================================================

FAMILIES.push({
  id: "vac-urine-no-additive",
  slug: "vacuette-urine-tube-no-additive",
  name: "VACUETTE® Пробирка для мочи без реагентов",
  shortDescription: "Сбор и транспортировка мочи. Жёлтый колпачок, жёлтое кольцо.",
  description: "Пробирки VACUETTE® для мочи без реагентов — для сбора и транспортировки образцов мочи. Жёлтый колпачок, жёлтое кольцо. Доступны PREMIUM и Без резьбы.",
  subcategory: "urine",
  additive: "urine-no-additive",
  capColor: "yellow",
  ringColor: "yellow",
  images: [IMG("probirka-dlya-mochi-bez-reagentov-premium-bezopasnaya-zakruchivayuschayasya-krys"), IMG("probirka-dlya-mochi-bez-reagentov-bez-rezby-s-kryshkoi-kolpachkom")],
  variantAttributes: [ATTR.closure],
  variants: [
    { catalogNumber: "454141", closure: CLOSURE.premium, pack: "50/1200" },
    { catalogNumber: "456065", closure: CLOSURE.nonRidged, pack: "50/1200" },
  ],
  i18n: {
    en: { name: "VACUETTE® Urine Tube — No Additive", shortDescription: "Urine collection and transport. Yellow cap, yellow ring.", description: "VACUETTE® Urine Tubes with no additive for collecting and transporting urine samples. Yellow cap, yellow ring. Available with PREMIUM safety screw cap or non-ridged with snap cap." },
    zh: { name: "VACUETTE® 尿液管 无添加剂", shortDescription: "尿液采集与运输。黄色封盖、黄色环。", description: "VACUETTE® 无添加剂尿液管,用于尿液采集和运输。黄色封盖、黄色环。提供 PREMIUM 与无螺纹两种规格。" },
  },
});

FAMILIES.push({
  id: "vac-urine-csm",
  slug: "vacuette-urine-tube-csm",
  name: "VACUETTE® Пробирка для мочи с CCM-средой",
  shortDescription: "Сохранность мочи для микробиологии. Жёлтый колпачок, чёрное кольцо.",
  description: "Пробирки VACUETTE® для мочи с CCM-средой обеспечивают сохранность образца для последующих микробиологических исследований. Жёлтый колпачок, чёрное кольцо. Без резьбы.",
  subcategory: "urine",
  additive: "urine-csm",
  capColor: "yellow",
  ringColor: "black",
  images: [IMG("probirka-dlya-mochi-s-csm-sredoi-bez-rezby-s-kryshkoi-kolpachkom")],
  variantAttributes: [],
  variants: [
    { catalogNumber: "454486", closure: CLOSURE.nonRidged, pack: "50/1200" },
  ],
  i18n: {
    en: { name: "VACUETTE® Urine Tube — CCM Medium", shortDescription: "Urine preservation for microbiology. Yellow cap, black ring.", description: "VACUETTE® Urine Tubes with CCM medium preserve urine samples for downstream microbiology testing. Yellow cap, black ring. Non-ridged." },
    zh: { name: "VACUETTE® 尿液管 CCM 培养基", shortDescription: "微生物用尿液保存管。黄色封盖、黑色环。", description: "VACUETTE® 含 CCM 培养基的尿液管,可保存尿液样本以进行后续微生物检测。黄色封盖、黑色环、无螺纹。" },
  },
});

FAMILIES.push({
  id: "vac-urine-stabilur",
  slug: "vacuette-urine-tube-stabilur",
  name: "VACUETTE® Пробирка для мочи со стабилизатором Stabilur",
  shortDescription: "Стабилизация мочи Stabilur. Жёлтый колпачок, красное кольцо, 16×100.",
  description: "Пробирки VACUETTE® со стабилизатором Stabilur — продлевают срок сохранности химического состава мочи. Жёлтый колпачок, красное кольцо, размер 16×100.",
  subcategory: "urine",
  additive: "urine-stabilur",
  capColor: "yellow",
  ringColor: "red",
  images: [IMG_JPG("probirka-dlya-mochi-so-stabilizatorom-stabilur")],
  variantAttributes: [],
  variants: [
    { catalogNumber: "455048", size: "16×100", pack: "50/1200" },
  ],
  i18n: {
    en: { name: "VACUETTE® Urine Tube — Stabilur", shortDescription: "Stabilur urine preservative. Yellow cap, red ring, 16×100.", description: "VACUETTE® Urine Tubes with Stabilur preservative extend the chemical stability of urine samples. Yellow cap, red ring, 16×100." },
    zh: { name: "VACUETTE® 尿液管 Stabilur 保存剂", shortDescription: "Stabilur 尿液保存。黄色封盖、红色环、16×100。", description: "VACUETTE® 含 Stabilur 保存剂的尿液管,可延长尿液样本化学组分的稳定性。黄色封盖、红色环、16×100。" },
  },
});

// =================================================================
// CONTAINERS / OTHER
// =================================================================

FAMILIES.push({
  id: "vac-urine-container-sterile",
  slug: "vacuette-urine-container-sterile",
  name: "Лабораторный контейнер для мочи (стерильный)",
  shortDescription: "Стерильный контейнер для сбора мочи.",
  description: "Лабораторный контейнер для сбора и транспортировки мочи. Стерильный, в индивидуальной упаковке.",
  subcategory: "container",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [IMG("laboratornyi-konteiner-dlya-mochi-sterilnyi")],
  variantAttributes: [],
  variants: [
    { catalogNumber: "724322", pack: "300/box" },
  ],
  i18n: {
    en: { name: "Sterile Urine Container", shortDescription: "Sterile container for urine collection.", description: "Laboratory container for urine collection and transport. Sterile, individually packed." },
    zh: { name: "无菌尿液采集容器", shortDescription: "无菌尿液采集容器。", description: "用于采集与运输尿液的实验室容器。无菌、单独包装。" },
  },
});

FAMILIES.push({
  id: "vac-urine-transfer",
  slug: "vacuette-urine-transfer-device",
  name: "Устройство для переноса проб мочи",
  shortDescription: "Перенос мочи в вакуумные пробирки. Короткое и длинное исполнения.",
  description: "Устройства для безопасного переноса проб мочи из контейнера в вакуумные пробирки VACUETTE®. Доступны короткое и длинное исполнения; стерильное в индивидуальной упаковке.",
  subcategory: "other",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [IMG("ustroistvo-dlya-perenosa-prob-mochi-korotkoe"), IMG("ustroistvo-dlya-perenosa-prob-mochi-dlinnoe"), IMG("ustroistvo-dlya-perenosa-prob-mochi-korotkoe-sterilnoe-v-individualnoi-upakovke")],
  variantAttributes: [{ key: "type", label_ru: "Тип", label_en: "Type", label_zh: "类型" }],
  variants: [
    { catalogNumber: "450251", type: "short", pack: "50 inner / 600 outer" },
    { catalogNumber: "450252", type: "long", pack: "50 inner / 600 outer" },
    { catalogNumber: "450253V1", type: "short, sterile, individually packed", pack: "400/box" },
  ],
  i18n: {
    en: { name: "Urine Transfer Device", shortDescription: "Urine transfer to vacuum tubes. Short / long versions.", description: "Devices for safe transfer of urine from a primary container into VACUETTE® vacuum tubes. Available in short and long versions; the sterile version is individually packed." },
    zh: { name: "尿液转移装置", shortDescription: "将尿液转移至真空管。短款 / 长款。", description: "用于将尿液从一级容器安全转移至 VACUETTE® 真空采血管的装置。提供短款与长款,无菌型号单独包装。" },
  },
});

// =================================================================
// ESR RACKS
// =================================================================

FAMILIES.push({
  id: "vac-esr-rack",
  slug: "vacuette-esr-rack",
  name: "Штатив с разметкой для анализа СОЭ",
  shortDescription: "Штатив для определения СОЭ методом Westergren.",
  description: "Штатив с разметкой для проведения анализа скорости оседания эритроцитов (СОЭ) методом Westergren на пробирках VACUETTE®.",
  subcategory: "esr",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [IMG("shtativ-s-razmetkoi-dlya-analiza-soe"), IMG("shtativ-s-razmetkoi-dlya-analiza-soe-2")],
  variantAttributes: [{ key: "model", label_ru: "Модель", label_en: "Model", label_zh: "型号" }],
  variants: [
    { catalogNumber: "836075", model: "836075" },
    { catalogNumber: "836077", model: "836077" },
  ],
  i18n: {
    en: { name: "ESR Rack with Markings", shortDescription: "Westergren ESR rack.", description: "Rack with measurement markings for the Westergren ESR method on VACUETTE® tubes." },
    zh: { name: "ESR 测定支架(带刻度)", shortDescription: "Westergren 法 ESR 支架。", description: "用于 VACUETTE® 试管 Westergren 法红细胞沉降率测定的带刻度支架。" },
  },
});

// =================================================================
// TOURNIQUETS
// =================================================================

FAMILIES.push({
  id: "vac-tourniquet",
  slug: "medical-tourniquet",
  name: "Жгут медицинский",
  shortDescription: "Жгут для венепункции. Взрослые / дети.",
  description: "Медицинский жгут для венепункции. Доступны исполнения для взрослых и для детей.",
  subcategory: "tourniquet",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [IMG("zhgut-meditsinskii"), IMG_JPG("zhgut-meditsinskii-dlya-detei")],
  variantAttributes: [{ key: "size", label_ru: "Размер", label_en: "Size", label_zh: "规格" }],
  variants: [
    { catalogNumber: "840050", size: "adult", pack: "100/box" },
    { catalogNumber: "840051", size: "paediatric", pack: "100/box" },
  ],
  i18n: {
    en: { name: "Medical Tourniquet", shortDescription: "Venipuncture tourniquet. Adult / paediatric.", description: "Medical tourniquet for venipuncture. Available in adult and paediatric sizes." },
    zh: { name: "医用止血带", shortDescription: "静脉穿刺止血带。成人 / 儿童。", description: "用于静脉穿刺的医用止血带,提供成人款与儿童款。" },
  },
});

// =================================================================
// TRANSPORT — VACUETTE® VTB / VTC + Isotherm
// =================================================================

FAMILIES.push({
  id: "vac-transport-vtb",
  slug: "vacuette-vtb-transport-container",
  name: "VACUETTE® Транспортный контейнер VTB",
  shortDescription: "Транспортный контейнер для пробирок. С коробкой HK0190 или без.",
  description: "Транспортный контейнер VACUETTE® VTB предназначен для безопасной перевозки пробирок с биообразцами. Доступен с почтовой коробкой для отправки HK0190 или без неё.",
  subcategory: "transport",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [IMG("transportnyi-konteiner-vacuette-vtb-s-korobkoi-dlya-transportirovki-hk0190"), IMG("transportnyi-konteiner-vacuette-vtb-bez-korobki-dlya-transportirovki")],
  variantAttributes: [{ key: "config", label_ru: "Комплект", label_en: "Configuration", label_zh: "配置" }],
  variants: [
    { catalogNumber: "472001", config: "with shipping box HK0190" },
    { catalogNumber: "472040", config: "without shipping box" },
  ],
  i18n: {
    en: { name: "VACUETTE® VTB Transport Container", shortDescription: "Transport container for tubes. With HK0190 box or without.", description: "VACUETTE® VTB transport container for the safe shipment of tubes with biological samples. Available with the HK0190 shipping box or stand-alone." },
    zh: { name: "VACUETTE® VTB 运输容器", shortDescription: "试管运输容器。可选 HK0190 邮寄盒。", description: "VACUETTE® VTB 运输容器用于安全运输装有生物样本的试管,可选配 HK0190 邮寄盒。" },
  },
});

FAMILIES.push({
  id: "vac-transport-vtc",
  slug: "vacuette-vtc-transport-container",
  name: "VACUETTE® Транспортный контейнер VTC",
  shortDescription: "Транспортный контейнер на 12 пробирок. С коробкой HK0190 или без.",
  description: "Транспортный контейнер VACUETTE® VTC рассчитан на 12 пробирок. Используется в составе системы транспортировки биообразцов. Доступен с почтовой коробкой HK0190 или без.",
  subcategory: "transport",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [IMG_JPG("transportnyi-konteiner-vacuette-vtc-s-korobkoi-dlya-transportirovki-hk0190"), IMG_JPG("transportnyi-konteiner-vacuette-vtc-bez-korobki-dlya-transportirovki-hk0190")],
  variantAttributes: [{ key: "config", label_ru: "Комплект", label_en: "Configuration", label_zh: "配置" }],
  variants: [
    { catalogNumber: "800105", config: "with shipping box HK0190" },
    { catalogNumber: "800110", config: "without shipping box" },
  ],
  i18n: {
    en: { name: "VACUETTE® VTC Transport Container", shortDescription: "12-tube transport container. With or without HK0190 box.", description: "VACUETTE® VTC transport container designed for 12 tubes. Used as part of a complete sample-shipment system. Available with HK0190 shipping box or stand-alone." },
    zh: { name: "VACUETTE® VTC 运输容器", shortDescription: "12 管运输容器。可选 HK0190 邮寄盒。", description: "VACUETTE® VTC 运输容器,可容纳 12 支试管,作为完整生物样本运输系统的组成部分,可选配 HK0190 邮寄盒。" },
  },
});

FAMILIES.push({
  id: "vac-transport-accessories",
  slug: "vacuette-transport-accessories",
  name: "VACUETTE® Аксессуары для транспортировки",
  shortDescription: "Вкладыши, прокладки, хладоэлементы, коробки и штативы.",
  description: "Расходные элементы и аксессуары для транспортных контейнеров VACUETTE® VTB / VTC: пористые вкладыши, гигроскопические прокладки, хладоэлементы, почтовые коробки и автоклавируемые штативы.",
  subcategory: "transport",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [
    IMG("seraya-poristaya-vkladka-dlya-transportnogo-konteinera-vacuette-vtb"),
    IMG("poristaya-vkladka-dlya-transportnogo-konteinera-vacuette-vtc-na-12-probirok"),
    IMG("gigroskopicheskaya-prokladka-dlya-transportnogo-konteinera-vacuette-vtb-i-vacuet"),
    IMG("hladoelement-dlya-transportnogo-konteinera-vacuette-vtb-220h120h11-mm-golubaya"),
    IMG("hladoelement-dlya-transportnogo-konteinera-vacuette-vtc-d-90-mm-golubaya"),
    IMG("korobka-dlya-otpravki-pochtoi-dlya-odnogo-transportnogo-konteinera-vacuette-vtb"),
  ],
  variantAttributes: [{ key: "item", label_ru: "Позиция", label_en: "Item", label_zh: "项目" }],
  variants: [
    { catalogNumber: "472010", item: "Grey porous insert for VTB" },
    { catalogNumber: "800101", item: "Porous insert for VTC (12 tubes)" },
    { catalogNumber: "472015", item: "Hygroscopic pad for VTB / VTC" },
    { catalogNumber: "472016", item: "Cold pack for VTB · 220×120×11 mm (blue)" },
    { catalogNumber: "472017", item: "Cold pack for VTC · D 90 mm (blue)" },
    { catalogNumber: "472011", item: "Autoclavable rack for 10 tubes" },
    { catalogNumber: "HK0190", item: "Mailing box for one VTB" },
  ],
  i18n: {
    en: { name: "VACUETTE® Transport Accessories", shortDescription: "Inserts, pads, cold packs, mailing boxes and racks.", description: "Spare parts and accessories for VACUETTE® VTB / VTC transport containers: porous inserts, hygroscopic pads, cold packs, mailing boxes and autoclavable racks." },
    zh: { name: "VACUETTE® 运输配件", shortDescription: "内衬、衬垫、冷敷包、邮寄盒、试管架。", description: "VACUETTE® VTB / VTC 运输容器的备件与配件:多孔内衬、吸水衬垫、冷敷包、邮寄盒及可高压灭菌的试管架。" },
  },
});

FAMILIES.push({
  id: "vac-isotherm-bag",
  slug: "vacuette-isotherm-bag",
  name: "Сумка Isotherm для транспортных контейнеров VACUETTE®",
  shortDescription: "Изотермические сумки на 1–4 контейнера VTB или 1 контейнер VTC.",
  description: "Изотермические сумки Isotherm для транспортных контейнеров VACUETTE® VTB и VTC. Поддерживают температурный режим биообразца при перевозке.",
  subcategory: "transport",
  additive: null,
  capColor: null,
  ringColor: null,
  images: [
    IMG_JPG("sumka-isotherm-dlya-odnogo-transportnogo-konteinera-vacuette-vtb"),
    IMG("sumka-isotherm-dlya-dvuh-transportnyh-konteinerov-vacuette-vtb"),
    IMG("sumka-isotherm-dlya-treh-transportnyh-konteinerov-vacuette-vtb"),
    IMG("sumka-isotherm-dlya-chetyreh-transportnyh-konteinerov-vacuette-vtb"),
    IMG("sumka-isotherm-dlya-odnogo-transportnogo-konteinera-vacuette-vtc"),
  ],
  variantAttributes: [{ key: "capacity", label_ru: "Вместимость", label_en: "Capacity", label_zh: "容量" }],
  variants: [
    { catalogNumber: "472020", capacity: "1 × VTB" },
    { catalogNumber: "472030", capacity: "2 × VTB" },
    { catalogNumber: "472023", capacity: "3 × VTB" },
    { catalogNumber: "472024", capacity: "4 × VTB" },
    { catalogNumber: "472022", capacity: "1 × VTC" },
  ],
  i18n: {
    en: { name: "Isotherm Bag for VACUETTE® Transport Containers", shortDescription: "Insulated bags for 1–4 VTB or 1 VTC container.", description: "Isotherm insulated bags for VACUETTE® VTB and VTC transport containers — they maintain the temperature of biological samples during shipment." },
    zh: { name: "VACUETTE® 运输容器恒温袋", shortDescription: "可容纳 1–4 个 VTB 或 1 个 VTC。", description: "VACUETTE® VTB / VTC 运输容器的 Isotherm 恒温袋,在运输过程中维持生物样本的温度。" },
  },
});

// __INSERT_HERE__

finalize();
