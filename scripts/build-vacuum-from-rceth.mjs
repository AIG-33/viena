// Generator that consumes parsed RCETH data + SKU map and produces
// data/products/vacuum-systems.json with families and rich variants.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// `parsed-skus.json` is produced by scripts/match-skus.mjs and already contains
// catalogNumber + skuMatch fields per record (structured matching against
// scripts/extract-gbo-skus output).
const parsed = JSON.parse(
  readFileSync("/tmp/rceth/parsed-skus.json", "utf8")
);

// ---------------------------------------------------------------------------
// 2. Family identity & metadata
// ---------------------------------------------------------------------------

// Mapping: additive code -> family info (UI label, default cap+ring, ru/en/zh names, descriptions)
const FAMILY_META = {
  // ===== ESR =====
  "esr-citrate-32": {
    nameRu: "VACUETTE® Пробирка для СОЭ (4NC цитрат натрия 3,2%)",
    nameEn: "VACUETTE® ESR Tube (4NC sodium citrate 3.2%)",
    nameZh: "VACUETTE® ESR 试管(4NC 柠檬酸钠 3.2%)",
    purpose: "ESR (скорость оседания эритроцитов) методом Вестергрена",
    purposeEn: "ESR (Westergren erythrocyte sedimentation rate)",
    purposeZh: "ESR(魏氏法红细胞沉降率)",
    capColor: "black",
    ringColor: "black",
    image: "/images/products/probirka-s-tsitratom-natriya-3-2.webp",
  },
  "citrate-32": {
    nameRu: "VACUETTE® Пробирка с цитратом натрия 3,2% (9NC коагуляция)",
    nameEn: "VACUETTE® Tube Sodium Citrate 3.2% (9NC Coagulation)",
    nameZh: "VACUETTE® 试管 柠檬酸钠 3.2%(9NC 凝血)",
    purpose: "Параметры коагуляции, соотношение реагент/кровь 1:9",
    purposeEn: "Coagulation parameters; reagent-to-blood ratio 1:9",
    purposeZh: "凝血参数,试剂与血液 1:9",
    capColor: "blue",
    ringColor: "white",
    image: "/images/products/probirka-s-tsitratom-natriya-3-2-premium-bezopasnaya-zakruchivayuschayasya-krysh.webp",
  },
  "citrate-38": {
    nameRu: "VACUETTE® Пробирка с цитратом натрия 3,8%",
    nameEn: "VACUETTE® Tube Sodium Citrate 3.8%",
    nameZh: "VACUETTE® 试管 柠檬酸钠 3.8%",
    purpose: "Коагулология (3,8%); соотношение реагент/кровь 1:9",
    purposeEn: "Coagulation testing (3.8%); ratio 1:9",
    purposeZh: "凝血检测(3.8%);1:9",
    capColor: "blue",
    ringColor: "black",
    image: "/images/products/probirka-s-tsitratom-natriya-3-8-premium-bezopasnaya-zakruchivayuschayasya-krysh.webp",
  },
  "ctad": {
    nameRu: "VACUETTE® Пробирка с CTAD-раствором",
    nameEn: "VACUETTE® Tube CTAD",
    nameZh: "VACUETTE® 试管 CTAD",
    purpose: "Коагулологические исследования с теофиллином, аденозином, дипиридамолом — стабилизация тромбоцитов",
    purposeEn: "Coagulation tests with theophylline, adenosine, dipyridamole — platelet stabilisation",
    purposeZh: "含茶碱、腺苷、双嘧达莫的凝血检测,稳定血小板",
    capColor: "blue",
    ringColor: "yellow",
    image: "/images/products/probirka-s-ctad-rastvorom-premium-bezopasnaya-zakruchivayuschayasya-kryshka.webp",
  },
  "acd-a": { nameRu: "VACUETTE® Пробирка с ACD-A", nameEn: "VACUETTE® Tube ACD-A", nameZh: "VACUETTE® 试管 ACD-A", purpose: "Иммунофенотипирование, пробы для HLA", purposeEn: "Immunophenotyping, HLA samples", purposeZh: "免疫分型、HLA 样本", capColor: "yellow", ringColor: "black", image: null },
  "acd-b": { nameRu: "VACUETTE® Пробирка с ACD-B", nameEn: "VACUETTE® Tube ACD-B", nameZh: "VACUETTE® 试管 ACD-B", purpose: "Молекулярные тесты, проточная цитометрия", purposeEn: "Molecular tests, flow cytometry", purposeZh: "分子检测、流式细胞术", capColor: "yellow", ringColor: "black", image: null },
  "cpda": { nameRu: "VACUETTE® Пробирка с CPDA", nameEn: "VACUETTE® Tube CPDA", nameZh: "VACUETTE® 试管 CPDA", purpose: "Хранение крови / трансфузионные исследования", purposeEn: "Blood storage / transfusion testing", purposeZh: "血液储存 / 输血检测", capColor: "yellow", ringColor: "black", image: null },

  // ===== Serum =====
  "serum-cat": {
    nameRu: "VACUETTE® Пробирка Serum CAT (активатор свёртывания)",
    nameEn: "VACUETTE® Serum CAT Tube (Clot Activator)",
    nameZh: "VACUETTE® 血清 CAT 试管(凝血活化剂)",
    purpose: "Получение сыворотки, активатор на стенке пробирки",
    purposeEn: "Serum preparation; clot activator on tube wall",
    purposeZh: "血清制备,内壁有凝血活化剂",
    capColor: "red",
    ringColor: "black",
    image: "/images/products/probirka-s-aktivatorom-obrazovaniya-sgustka-premium-bezopasnaya-zakruchivayuscha.webp",
  },
  "serum-cat-gel": {
    nameRu: "VACUETTE® Serum Separator (CAT + гель)",
    nameEn: "VACUETTE® Serum Separator Tube (CAT + gel)",
    nameZh: "VACUETTE® 血清分离管(CAT + 分离胶)",
    purpose: "Сыворотка с инертным разделительным гелем",
    purposeEn: "Serum with inert separator gel",
    purposeZh: "含惰性分离胶的血清管",
    capColor: "red",
    ringColor: "yellow",
    image: "/images/products/probirka-s-aktivatorom-obrazovaniya-sgustka-i-gelem-premium-bezopasnaya-zakruchi.webp",
  },
  "serum-cat-fast": {
    nameRu: "VACUETTE® FAST Serum CAT (ускоренная сыворотка)",
    nameEn: "VACUETTE® FAST Serum CAT Tube",
    nameZh: "VACUETTE® FAST 血清 CAT 试管",
    purpose: "Ускоренное образование сгустка ~5 мин + разделительный гель",
    purposeEn: "Rapid clot ~5 min + separator gel",
    purposeZh: "快速凝血(约 5 分钟)+ 分离胶",
    capColor: "orange",
    ringColor: "yellow",
    image: "/images/products/probirka-s-s-aktivatorom-uskorennogo-obrazovaniya-sgustka-i-gelem-bez-rezby-s-kr.webp",
  },
  "serum-sep": {
    nameRu: "VACUETTE® Serum Separator (без CAT)",
    nameEn: "VACUETTE® Serum Separator Tube (no CAT)",
    nameZh: "VACUETTE® 血清分离管(无 CAT)",
    purpose: "Сыворотка с разделительным гелем без активатора",
    purposeEn: "Serum with separator gel, no clot activator",
    purposeZh: "含分离胶的血清管,无凝血活化剂",
    capColor: "red",
    ringColor: "yellow",
    image: null,
  },
  "crossmatch-serum": {
    nameRu: "VACUETTE® Crossmatch Serum CAT",
    nameEn: "VACUETTE® Crossmatch Serum CAT",
    nameZh: "VACUETTE® Crossmatch 血清 CAT",
    purpose: "Проба на совместимость крови (cross-match)",
    purposeEn: "Blood cross-match testing",
    purposeZh: "交叉配血",
    capColor: "pink",
    ringColor: "black",
    image: null,
  },

  // ===== Heparin =====
  "li-heparin": {
    nameRu: "VACUETTE® Пробирка с Li-гепарином",
    nameEn: "VACUETTE® Lithium Heparin Tube",
    nameZh: "VACUETTE® 锂肝素试管",
    purpose: "Биохимия плазмы, Li-гепарин на стенке пробирки",
    purposeEn: "Plasma chemistry; lithium heparin coated wall",
    purposeZh: "血浆生化,锂肝素涂壁",
    capColor: "green",
    ringColor: "black",
    image: "/images/products/probirka-s-li-geparinom-premium-bezopasnaya-zakruchivayuschayasya-kryshka.webp",
  },
  "li-heparin-gel": {
    nameRu: "VACUETTE® Plasma Separator (Li-гепарин + гель)",
    nameEn: "VACUETTE® Plasma Separator Tube (LH + gel)",
    nameZh: "VACUETTE® 血浆分离管(LH + 分离胶)",
    purpose: "Плазма для биохимии с разделительным гелем",
    purposeEn: "Plasma chemistry with separator gel",
    purposeZh: "含分离胶的血浆生化",
    capColor: "green",
    ringColor: "yellow",
    image: "/images/products/probirka-s-li-geparinom-i-gelem-premium-bezopasnaya-zakruchivayuschayasya-kryshk.webp",
  },
  "na-heparin": {
    nameRu: "VACUETTE® Пробирка с Na-гепарином",
    nameEn: "VACUETTE® Sodium Heparin Tube",
    nameZh: "VACUETTE® 钠肝素试管",
    purpose: "Спецанализы плазмы / микроэлементы",
    purposeEn: "Specialty plasma analyses / trace elements",
    purposeZh: "特殊血浆分析 / 微量元素",
    capColor: "green",
    ringColor: "green",
    image: "/images/products/probirka-s-na-geparinom-premium-bezopasnaya-zakruchivayuschayasya-kryshka.webp",
  },
  "li-heparin-iodacetate": {
    nameRu: "VACUETTE® Li-гепарин / йодацетат (Glycohaemoglobin)",
    nameEn: "VACUETTE® Lithium Heparin / Iodacetate Tube",
    nameZh: "VACUETTE® 锂肝素 / 碘乙酸盐试管",
    purpose: "Гликозилированный гемоглобин (HbA1c)",
    purposeEn: "Glycohaemoglobin (HbA1c)",
    purposeZh: "糖化血红蛋白(HbA1c)",
    capColor: "grey",
    ringColor: "black",
    image: null,
  },

  // ===== EDTA =====
  "k2edta": {
    nameRu: "VACUETTE® Пробирка с K2EDTA",
    nameEn: "VACUETTE® Tube K2EDTA",
    nameZh: "VACUETTE® 试管 K2EDTA",
    purpose: "Гематология (CBC), HbA1c. Дикалиевая соль ЭДТА",
    purposeEn: "Haematology (CBC), HbA1c. Dipotassium EDTA",
    purposeZh: "血液学(CBC)、HbA1c。二钾 EDTA",
    capColor: "lavender",
    ringColor: "white",
    image: "/images/products/probirka-s-k2edta-premium-bezopasnaya-zakruchivayuschayasya-kryshka.jpg",
  },
  "k3edta": {
    nameRu: "VACUETTE® Пробирка с K3EDTA",
    nameEn: "VACUETTE® Tube K3EDTA",
    nameZh: "VACUETTE® 试管 K3EDTA",
    purpose: "Гематология. Жидкая трикалиевая соль ЭДТА",
    purposeEn: "Haematology. Liquid tripotassium EDTA",
    purposeZh: "血液学。液态三钾 EDTA",
    capColor: "lavender",
    ringColor: "white",
    image: "/images/products/probirka-s-k3edta-premium-bezopasnaya-zakruchivayuschayasya-kryshka.webp",
  },
  "k2edta-gel": {
    nameRu: "VACUETTE® K2EDTA + гель",
    nameEn: "VACUETTE® Tube K2EDTA + Gel",
    nameZh: "VACUETTE® 试管 K2EDTA + 分离胶",
    purpose: "Молекулярная диагностика: плазма с разделительным гелем",
    purposeEn: "Molecular diagnostics: plasma with separator gel",
    purposeZh: "分子诊断:血浆 + 分离胶",
    capColor: "lavender",
    ringColor: "yellow",
    image: "/images/products/probirka-s-k2edta-i-gelem-premium-bezopasnaya-zakruchivayuschayasya-kryshka.webp",
  },
  "k3edta-gel": {
    nameRu: "VACUETTE® K3EDTA + гель",
    nameEn: "VACUETTE® Tube K3EDTA + Gel",
    nameZh: "VACUETTE® 试管 K3EDTA + 分离胶",
    purpose: "Плазма для молекулярных тестов (K3EDTA + гель)",
    purposeEn: "Plasma for molecular tests (K3EDTA + gel)",
    purposeZh: "分子检测的血浆(K3EDTA + 分离胶)",
    capColor: "lavender",
    ringColor: "yellow",
    image: null,
  },
  "edta-aprotinin": {
    nameRu: "VACUETTE® EDTA + Апротинин",
    nameEn: "VACUETTE® Tube EDTA + Aprotinin",
    nameZh: "VACUETTE® 试管 EDTA + 抑肽酶",
    purpose: "Стабилизация лабильных аналитов (АКТГ, глюкагон)",
    purposeEn: "Stabilisation of labile analytes (ACTH, glucagon)",
    purposeZh: "稳定不稳定分析物(ACTH、胰高血糖素)",
    capColor: "pink",
    ringColor: "black",
    image: null,
  },
  "crossmatch-k3edta": {
    nameRu: "VACUETTE® Crossmatch K3EDTA",
    nameEn: "VACUETTE® Crossmatch K3EDTA",
    nameZh: "VACUETTE® Crossmatch K3EDTA",
    purpose: "Проба на совместимость с K3EDTA",
    purposeEn: "Blood cross-match with K3EDTA",
    purposeZh: "K3EDTA 交叉配血",
    capColor: "pink",
    ringColor: "black",
    image: null,
  },

  // ===== Glucose =====
  "fluoride-oxalate": {
    nameRu: "VACUETTE® FX (NaF / K-оксалат)",
    nameEn: "VACUETTE® Tube FX (NaF / K-oxalate)",
    nameZh: "VACUETTE® 试管 FX(NaF / 草酸钾)",
    purpose: "Глюкоза, лактат — ингибитор гликолиза + антикоагулянт",
    purposeEn: "Glucose, lactate — glycolysis inhibitor + anticoagulant",
    purposeZh: "葡萄糖、乳酸 — 糖酵解抑制剂 + 抗凝剂",
    capColor: "grey",
    ringColor: "white",
    image: "/images/products/probirka-s-na-ftoridom-k-oksalatom.webp",
  },
  "fluoride-edta": {
    nameRu: "VACUETTE® FE (NaF / K3EDTA)",
    nameEn: "VACUETTE® Tube FE (NaF / K3EDTA)",
    nameZh: "VACUETTE® 试管 FE(NaF / K3EDTA)",
    purpose: "Глюкоза. NaF + K3EDTA — стабильный антикоагулянт",
    purposeEn: "Glucose. NaF + K3EDTA — stable anticoagulant",
    purposeZh: "葡萄糖。NaF + K3EDTA — 稳定抗凝剂",
    capColor: "grey",
    ringColor: "white",
    image: "/images/products/probirka-s-na-ftoridom-k3edta-premium-bezopasnaya-zakruchivayuschayasya-kryshka.webp",
  },
  "fluoride-edta-test": {
    nameRu: "VACUETTE® FE Glucose Test only",
    nameEn: "VACUETTE® Tube FE Glucose Test only",
    nameZh: "VACUETTE® 试管 FE 葡萄糖检测",
    purpose: "Только тест на глюкозу (NaF / K3EDTA)",
    purposeEn: "Glucose-only test (NaF / K3EDTA)",
    purposeZh: "仅葡萄糖检测(NaF / K3EDTA)",
    capColor: "grey",
    ringColor: "white",
    image: null,
  },
  "fc-mix": {
    nameRu: "VACUETTE® FC Mix (цитратный буфер)",
    nameEn: "VACUETTE® FC Mix Tube (citrate buffer)",
    nameZh: "VACUETTE® FC Mix 试管(柠檬酸缓冲液)",
    purpose: "Стабилизация глюкозы — цитратный буфер + NaF + EDTA",
    purposeEn: "Glucose stabilisation — citrate buffer + NaF + EDTA",
    purposeZh: "葡萄糖稳定 — 柠檬酸缓冲液 + NaF + EDTA",
    capColor: "grey",
    ringColor: "white",
    image: null,
  },

  // ===== Trace =====
  "trace-elements": {
    nameRu: "VACUETTE® Trace Elements",
    nameEn: "VACUETTE® Trace Elements Tube",
    nameZh: "VACUETTE® 微量元素试管",
    purpose: "Определение микроэлементов",
    purposeEn: "Trace element determination",
    purposeZh: "微量元素检测",
    capColor: "royal-blue",
    ringColor: "black",
    image: null,
  },
  "trace-elements-znf": {
    nameRu: "VACUETTE® ZNF Trace Elements",
    nameEn: "VACUETTE® ZNF Trace Elements",
    nameZh: "VACUETTE® ZNF 微量元素试管",
    purpose: "Определение цинка, фтора и др. микроэлементов",
    purposeEn: "Zinc, fluoride and trace element determination",
    purposeZh: "锌、氟及微量元素检测",
    capColor: "royal-blue",
    ringColor: "black",
    image: null,
  },

  // ===== Misc =====
  "no-additive": {
    nameRu: "VACUETTE® Z (без добавок)",
    nameEn: "VACUETTE® Z No Additive Tube",
    nameZh: "VACUETTE® Z 无添加剂试管",
    purpose: "Образец без добавок (биохимия, токсикология)",
    purposeEn: "Plain tube (chemistry, toxicology)",
    purposeZh: "无添加剂(生化、毒理)",
    capColor: "white",
    ringColor: "white",
    image: null,
  },
  "discard": {
    nameRu: "VACUETTE® Z Discard Tube",
    nameEn: "VACUETTE® Z Discard Tube",
    nameZh: "VACUETTE® Z 弃用试管",
    purpose: "Технологический «дискард» при заборе из катетера",
    purposeEn: "Discard tube for catheter draws",
    purposeZh: "导管采血用弃用试管",
    capColor: "white",
    ringColor: "white",
    image: null,
  },
  "homocysteine": {
    nameRu: "VACUETTE® Homocysteine Detection",
    nameEn: "VACUETTE® Homocysteine Detection Tube",
    nameZh: "VACUETTE® 同型半胱氨酸检测试管",
    purpose: "Стабилизация гомоцистеина",
    purposeEn: "Homocysteine stabilisation",
    purposeZh: "同型半胱氨酸稳定",
    capColor: "white",
    ringColor: "red",
    image: null,
  },

  // ===== Urine =====
  "urine": {
    nameRu: "VACUETTE® Пробирка для мочи",
    nameEn: "VACUETTE® Urine Tube",
    nameZh: "VACUETTE® 尿液管",
    purpose: "Сбор и транспортировка мочи",
    purposeEn: "Urine collection and transport",
    purposeZh: "尿液采集与运输",
    capColor: "yellow",
    ringColor: "yellow",
    image: "/images/products/probirka-dlya-mochi-bez-reagentov-premium-bezopasnaya-zakruchivayuschayasya-krys.webp",
  },
};

// MiniCollect overrides — capillary equivalents
const MINI_OVERRIDES = {
  "k2edta": { nameRu: "MiniCollect® Пробирка с K2EDTA", nameEn: "MiniCollect® Tube K2EDTA", nameZh: "MiniCollect® 试管 K2EDTA", capColor: "lavender", ringColor: null, image: "/images/products/probirka-s-k2-edta-2.webp" },
  "k3edta": { nameRu: "MiniCollect® Пробирка с K3EDTA", nameEn: "MiniCollect® Tube K3EDTA", nameZh: "MiniCollect® 试管 K3EDTA", capColor: "lavender", ringColor: null, image: "/images/products/probirka-s-k3-edta-prozrachnaya-etiketka.webp" },
  "li-heparin": { nameRu: "MiniCollect® Пробирка с Li-гепарином", nameEn: "MiniCollect® Tube Lithium Heparin", nameZh: "MiniCollect® 试管 锂肝素", capColor: "green", ringColor: null, image: "/images/products/probirka-s-li-geparinom-2.webp" },
  "li-heparin-gel": { nameRu: "MiniCollect® Li-гепарин + гель", nameEn: "MiniCollect® Tube Lithium Heparin + Gel", nameZh: "MiniCollect® 试管 锂肝素 + 分离胶", capColor: "lightgreen", ringColor: null, image: "/images/products/probirka-s-li-geparinom-i-razdelitelnym-gelem.webp" },
  "serum-cat": { nameRu: "MiniCollect® Пробирка Serum CAT", nameEn: "MiniCollect® Serum CAT Tube", nameZh: "MiniCollect® 血清 CAT 试管", capColor: "red", ringColor: null, image: "/images/products/probirka-s-aktivatorom-svertyvaniya.webp" },
  "serum-cat-gel": { nameRu: "MiniCollect® Serum + гель", nameEn: "MiniCollect® Serum + Gel Tube", nameZh: "MiniCollect® 血清 + 分离胶试管", capColor: "gold", ringColor: null, image: "/images/products/probirka-s-aktivatorom-svertyvaniya-i-razdelitelnym-gelem.webp" },
  "fluoride-oxalate": { nameRu: "MiniCollect® NaF / K-оксалат", nameEn: "MiniCollect® NaF / K-Oxalate Tube", nameZh: "MiniCollect® NaF / 草酸钾试管", capColor: "grey", ringColor: null, image: "/images/products/probirka-s-na-ftoridom-k-oksalatom-2.webp" },
  "citrate-32": { nameRu: "MiniCollect® Цитрат натрия 3,2%", nameEn: "MiniCollect® Sodium Citrate 3.2% Tube", nameZh: "MiniCollect® 柠檬酸钠 3.2% 试管", capColor: "blue", ringColor: null, image: "/images/products/probirka-s-tsitratom-natriya-3-2.webp" },
};

// ---------------------------------------------------------------------------
// 3. Group products into families
// ---------------------------------------------------------------------------

function familyKey(p) {
  // Family identity: type + additive code (sub-types like sandwich don't split families)
  if (p.type === "venous-tube" || p.type === "urine-tube") return `${p.type}::${p.additive}`;
  if (p.type === "minicollect-tube" || p.type === "minicollect-complete") return `${p.type}::${p.additive}`;
  return p.type;
}

const familyMap = new Map();

for (const p of parsed) {
  const key = familyKey(p);
  if (!familyMap.has(key)) familyMap.set(key, []);
  familyMap.get(key).push(p);
}

// ---------------------------------------------------------------------------
// 4. Emit Product[] entries
// ---------------------------------------------------------------------------

const SUBCATEGORY_BY_TYPE = {
  "venous-tube": "venous",
  "urine-tube": "urine",
  "minicollect-tube": "capillary",
  "minicollect-complete": "capillary",
  "esr-rack": "esr",
  "standard-holder": "tourniquet", // re-route holders to tourniquet/holder bucket
  "speedy-holder": "tourniquet",
  "quickshield-holder": "tourniquet",
  "quickshield-complete": "tourniquet",
  "blood-culture-holder": "tourniquet",
  "safelink": "tourniquet",
  "holdex": "tourniquet",
  "plastic-cannula": "transport",
  "blood-transfer": "transport",
  "sample-adapter": "transport",
  "urine-beaker": "container",
  "urine-transfer": "other",
};

// Use a stable subcategory bucket: "holder" instead of tourniquet (we'll add a new tab)
SUBCATEGORY_BY_TYPE["standard-holder"] = "holder";
SUBCATEGORY_BY_TYPE["speedy-holder"] = "holder";
SUBCATEGORY_BY_TYPE["quickshield-holder"] = "holder";
SUBCATEGORY_BY_TYPE["quickshield-complete"] = "holder";
SUBCATEGORY_BY_TYPE["blood-culture-holder"] = "holder";
SUBCATEGORY_BY_TYPE["safelink"] = "holder";
SUBCATEGORY_BY_TYPE["holdex"] = "holder";

const TYPE_META = {
  "esr-rack": {
    nameRu: "Штатив с разметкой для СОЭ",
    nameEn: "ESR Rack with graduations",
    nameZh: "ESR 测定支架(带刻度)",
    image: "/images/products/shtativ-s-razmetkoi-dlya-analiza-soe.webp",
  },
  "standard-holder": {
    nameRu: "Стандартный держатель пробирок",
    nameEn: "Standard Tube Holder",
    nameZh: "标准试管支架",
    image: null,
  },
  "speedy-holder": {
    nameRu: "Speedy Quick Release держатель",
    nameEn: "Speedy Quick Release Holder",
    nameZh: "Speedy 快速释放支架",
    image: null,
  },
  "quickshield-holder": {
    nameRu: "VACUETTE® QUICKSHIELD Safety Tube Holder",
    nameEn: "VACUETTE® QUICKSHIELD Safety Tube Holder",
    nameZh: "VACUETTE® QUICKSHIELD 安全支架",
    image: null,
  },
  "quickshield-complete": {
    nameRu: "VACUETTE® QUICKSHIELD Complete (держатель + игла)",
    nameEn: "VACUETTE® QUICKSHIELD Complete (holder + needle)",
    nameZh: "VACUETTE® QUICKSHIELD Complete(支架 + 针头)",
    image: null,
  },
  "safelink": {
    nameRu: "VACUETTE® SAFELINK Holder с luer lock",
    nameEn: "VACUETTE® SAFELINK Holder with luer lock",
    nameZh: "VACUETTE® SAFELINK 鲁尔锁支架",
    image: null,
  },
  "blood-culture-holder": {
    nameRu: "VACUETTE® Blood Culture Holder",
    nameEn: "VACUETTE® Blood Culture Holder",
    nameZh: "VACUETTE® 血培养支架",
    image: null,
  },
  "holdex": {
    nameRu: "HOLDEX® одноразовый держатель",
    nameEn: "HOLDEX® Single-Use Holder",
    nameZh: "HOLDEX® 一次性支架",
    image: null,
  },
  "plastic-cannula": {
    nameRu: "Пластиковая канюля HOLDEX®",
    nameEn: "HOLDEX® Plastic Cannula",
    nameZh: "HOLDEX® 塑料套管",
    image: null,
  },
  "blood-transfer": {
    nameRu: "VACUETTE® Blood Transfer Unit",
    nameEn: "VACUETTE® Blood Transfer Unit",
    nameZh: "VACUETTE® 血液转移器",
    image: null,
  },
  "sample-adapter": {
    nameRu: "Sample Collection Adapter",
    nameEn: "Sample Collection Adapter",
    nameZh: "样本采集适配器",
    image: null,
  },
  "urine-beaker": {
    nameRu: "Контейнер для мочи Urine Beaker",
    nameEn: "Urine Beaker",
    nameZh: "尿液采集杯 Urine Beaker",
    image: "/images/products/laboratornyi-konteiner-dlya-mochi-sterilnyi.webp",
  },
  "urine-transfer": {
    nameRu: "Устройство для переноса проб мочи",
    nameEn: "Urine Transfer Device",
    nameZh: "尿液转移装置",
    image: "/images/products/ustroistvo-dlya-perenosa-prob-mochi-korotkoe.webp",
  },
};

const ATTR = {
  closure: { key: "closure", label_ru: "Крышка", label_en: "Closure", label_zh: "封盖" },
  volume: { key: "volume", label_ru: "Объём, мл", label_en: "Volume, ml", label_zh: "容量, 毫升" },
  size: { key: "size", label_ru: "Размер, мм", label_en: "Size, mm", label_zh: "规格, 毫米" },
  capColor: { key: "capColor", label_ru: "Цвет колпачка", label_en: "Cap colour", label_zh: "封盖颜色" },
  ringColor: { key: "ringColor", label_ru: "Цвет кольца", label_en: "Ring colour", label_zh: "环颜色" },
  material: { key: "material", label_ru: "Материал", label_en: "Material", label_zh: "材料" },
  label: { key: "label", label_ru: "Этикетка", label_en: "Label", label_zh: "标签" },
};

const FAMILIES = [];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[®]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asLabel(flags) {
  if (flags.includes("g-barcode")) return "G-barcode";
  if (flags.includes("transparent-label")) return "transparent";
  if (flags.includes("paper-label")) return "paper";
  if (flags.includes("polyester-label")) return "polyester";
  return "standard";
}

function asMaterial(p) {
  if (p.material) return p.material;
  // Most modern VACUETTE tubes are PET unless specified.
  return null;
}

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${String(idCounter).padStart(3, "0")}`;
}

// Family generation from grouped products
const ORDERED_VENOUS_KEYS = [
  "venous-tube::esr-citrate-32",
  "venous-tube::citrate-32",
  "venous-tube::citrate-38",
  "venous-tube::ctad",
  "venous-tube::serum-cat",
  "venous-tube::serum-cat-gel",
  "venous-tube::serum-cat-fast",
  "venous-tube::serum-sep",
  "venous-tube::crossmatch-serum",
  "venous-tube::li-heparin",
  "venous-tube::li-heparin-gel",
  "venous-tube::na-heparin",
  "venous-tube::li-heparin-iodacetate",
  "venous-tube::k2edta",
  "venous-tube::k3edta",
  "venous-tube::k2edta-gel",
  "venous-tube::k3edta-gel",
  "venous-tube::edta-aprotinin",
  "venous-tube::crossmatch-k3edta",
  "venous-tube::fluoride-oxalate",
  "venous-tube::fluoride-edta",
  "venous-tube::fluoride-edta-test",
  "venous-tube::fc-mix",
  "venous-tube::trace-elements",
  "venous-tube::trace-elements-znf",
  "venous-tube::no-additive",
  "venous-tube::discard",
  "venous-tube::homocysteine",
  "venous-tube::acd-a",
  "venous-tube::acd-b",
  "venous-tube::cpda",
];

function emitTubeFamily(typeKey, additiveCode, members, isMini = false) {
  const meta = isMini && MINI_OVERRIDES[additiveCode]
    ? { ...FAMILY_META[additiveCode], ...MINI_OVERRIDES[additiveCode] }
    : FAMILY_META[additiveCode];
  if (!meta) {
    console.warn("Skipping family without meta:", additiveCode);
    return;
  }

  const subcategory = isMini
    ? "capillary"
    : (typeKey === "urine-tube" ? "urine" : "venous");

  const variants = members.map((p) => ({
    catalogNumber: p.catalogNumber ?? "",
    sourceName: p.rawName,
    closure: p.closure ?? null,
    volume: p.volume ?? null,
    size: p.size ?? null,
    capColor: p.capColor ?? meta.capColor ?? null,
    ringColor: p.ringColor ?? meta.ringColor ?? null,
    material: asMaterial(p),
    label: asLabel(p.flags),
    flags: p.flags,
  }));

  // Filter out attributes that have only a single value across all variants
  const attrPool = [ATTR.volume, ATTR.size, ATTR.closure, ATTR.capColor, ATTR.ringColor, ATTR.material, ATTR.label];
  const variantAttributes = attrPool.filter((a) => {
    const values = new Set();
    for (const v of variants) {
      const val = v[a.key];
      if (val) values.add(val);
    }
    return values.size > 1;
  });

  const slug = isMini ? `minicollect-${slugify(additiveCode)}` : slugify(`${typeKey === "urine-tube" ? "urine" : "vacuette"}-${additiveCode}`);
  const id = nextId(isMini ? "mc" : (typeKey === "urine-tube" ? "vac-u" : "vac"));

  FAMILIES.push({
    id,
    slug,
    name: meta.nameRu,
    shortDescription: meta.purpose,
    description: `${meta.purpose}. ${variants.length} вариант(ов) в линейке.`,
    categoryId: "vacuum-systems",
    subcategory,
    additive: additiveCode,
    capColor: meta.capColor ?? null,
    ringColor: meta.ringColor ?? null,
    images: meta.image ? [meta.image] : [],
    variantAttributes,
    variants,
    specs: [],
    tags: [],
    featured: ["k2edta", "k3edta", "serum-cat", "serum-cat-gel", "li-heparin", "citrate-32", "citrate-38"].includes(additiveCode) && !isMini,
    inStock: true,
    catalogNumber: variants.find((v) => v.catalogNumber)?.catalogNumber ?? "",
    manufacturer: "greiner-bio-one",
    createdAt: "2024-01-01",
    sort: FAMILIES.length,
    i18n: {
      en: {
        name: meta.nameEn,
        shortDescription: meta.purposeEn,
        description: `${meta.purposeEn}. ${variants.length} variant(s) in the lineup.`,
      },
      zh: {
        name: meta.nameZh,
        shortDescription: meta.purposeZh,
        description: `${meta.purposeZh}。共 ${variants.length} 个规格。`,
      },
    },
  });
}

// 1) Venous tubes
for (const key of ORDERED_VENOUS_KEYS) {
  const members = familyMap.get(key);
  if (!members) continue;
  const additive = key.split("::")[1];
  emitTubeFamily("venous-tube", additive, members, false);
}

// 2) Urine tubes
const urineKeys = [...familyMap.keys()].filter((k) => k.startsWith("urine-tube::"));
for (const key of urineKeys) {
  const members = familyMap.get(key);
  if (!members) continue;
  const additive = key.split("::")[1];
  emitTubeFamily("urine-tube", additive, members, false);
}

// 3) MiniCollect tubes
const miniKeys = [...familyMap.keys()].filter((k) => k.startsWith("minicollect-tube::"));
for (const key of miniKeys) {
  const members = familyMap.get(key);
  if (!members) continue;
  const additive = key.split("::")[1];
  emitTubeFamily("minicollect-tube", additive, members, true);
}

// 4) MiniCollect complete (carrier-tube assemblies) — group similarly
const miniCompleteKeys = [...familyMap.keys()].filter((k) => k.startsWith("minicollect-complete::"));
for (const key of miniCompleteKeys) {
  const members = familyMap.get(key);
  if (!members) continue;
  const additive = key.split("::")[1];
  // Reuse Mini override but suffix slug with -complete
  const meta = MINI_OVERRIDES[additive] && FAMILY_META[additive]
    ? { ...FAMILY_META[additive], ...MINI_OVERRIDES[additive] }
    : FAMILY_META[additive];
  if (!meta) continue;

  const variants = members.map((p) => ({
    catalogNumber: p.catalogNumber ?? "",
    sourceName: p.rawName,
    volume: p.volume ?? null,
    capColor: p.capColor ?? meta.capColor ?? null,
    ringColor: p.ringColor ?? meta.ringColor ?? null,
    label: asLabel(p.flags),
    sterile: p.flags.includes("sterile") ? "sterile" : null,
    flags: p.flags,
  }));
  const variantAttributes = [ATTR.volume, ATTR.label, { key: "sterile", label_ru: "Стерильность", label_en: "Sterility", label_zh: "无菌" }].filter((a) => {
    const set = new Set(variants.map((v) => v[a.key]).filter(Boolean));
    return set.size > 1;
  });

  const id = nextId("mcc");
  FAMILIES.push({
    id,
    slug: `minicollect-complete-${slugify(additive)}`,
    name: `${meta.nameRu} — Complete (с carrier tube 13×75)`,
    shortDescription: `${meta.purpose}. Готовая сборка с переходником 13×75 для центрифуг.`,
    description: `MiniCollect® Complete: ${meta.purpose}. Готовая сборка с переходником (carrier tube) 13×75. ${variants.length} вариант(ов).`,
    categoryId: "vacuum-systems",
    subcategory: "capillary",
    additive,
    capColor: meta.capColor ?? null,
    ringColor: meta.ringColor ?? null,
    images: meta.image ? [meta.image] : [],
    variantAttributes,
    variants,
    specs: [],
    tags: ["complete"],
    featured: false,
    inStock: true,
    catalogNumber: variants.find((v) => v.catalogNumber)?.catalogNumber ?? "",
    manufacturer: "greiner-bio-one",
    createdAt: "2024-01-01",
    sort: FAMILIES.length,
    i18n: {
      en: { name: `${meta.nameEn} — Complete (carrier tube 13×75)`, shortDescription: `${meta.purposeEn}. Pre-assembled with carrier tube 13×75.`, description: `MiniCollect® Complete: ${meta.purposeEn}. ${variants.length} variant(s).` },
      zh: { name: `${meta.nameZh} — Complete(配 carrier tube 13×75)`, shortDescription: `${meta.purposeZh}。预组装 carrier tube 13×75。`, description: `MiniCollect® Complete:${meta.purposeZh}。共 ${variants.length} 种规格。` },
    },
  });
}

// 5) Other product types: holders, needles, racks, beakers, transfer devices.
function emitGenericFamily(typeKey, members) {
  const meta = TYPE_META[typeKey] ?? {};
  const sub = SUBCATEGORY_BY_TYPE[typeKey] ?? "other";
  const variants = members.map((p, i) => ({
    catalogNumber: p.catalogNumber ?? "",
    sourceName: p.rawName,
    config: p.rawName.replace(/^.+?(?:single-packed|10 pcs|100 pcs|bag|sterile|non-sterile)?\s*/i, "").trim() || `Variant ${i + 1}`,
    flags: p.flags,
  }));
  const id = nextId("vac-acc");
  FAMILIES.push({
    id,
    slug: slugify(typeKey),
    name: meta.nameRu ?? typeKey,
    shortDescription: meta.nameRu ? meta.nameRu : "Аксессуар системы VACUETTE®",
    description: `${meta.nameRu ?? typeKey}. ${variants.length} вариант(ов).`,
    categoryId: "vacuum-systems",
    subcategory: sub,
    additive: null,
    capColor: null,
    ringColor: null,
    images: meta.image ? [meta.image] : [],
    variantAttributes: variants.length > 1 ? [{ key: "config", label_ru: "Исполнение", label_en: "Configuration", label_zh: "配置" }] : [],
    variants,
    specs: [],
    tags: [],
    featured: false,
    inStock: true,
    catalogNumber: variants.find((v) => v.catalogNumber)?.catalogNumber ?? "",
    manufacturer: "greiner-bio-one",
    createdAt: "2024-01-01",
    sort: FAMILIES.length,
    i18n: {
      en: { name: meta.nameEn ?? typeKey, shortDescription: meta.nameEn ?? "VACUETTE® system accessory", description: `${meta.nameEn ?? typeKey}. ${variants.length} variant(s).` },
      zh: { name: meta.nameZh ?? typeKey, shortDescription: meta.nameZh ?? "VACUETTE® 系统配件", description: `${meta.nameZh ?? typeKey}。共 ${variants.length} 种。` },
    },
  });
}

const ACCESSORY_TYPES = [
  "esr-rack",
  "standard-holder",
  "speedy-holder",
  "quickshield-holder",
  "quickshield-complete",
  "safelink",
  "blood-culture-holder",
  "holdex",
  "plastic-cannula",
  "blood-transfer",
  "sample-adapter",
  "urine-beaker",
  "urine-transfer",
];

for (const t of ACCESSORY_TYPES) {
  const members = parsed.filter((p) => p.type === t);
  if (members.length > 0) emitGenericFamily(t, members);
}

// ---------------------------------------------------------------------------
// 6. Legacy entries from the original Russian inventory that are NOT in RCETH.
//    These are accessories with registration certificates outside this RCETH
//    record (transport containers, tourniquets, isotherm bags, cold packs).
// ---------------------------------------------------------------------------
const LEGACY_FAMILIES = [
  {
    id: nextId("vac-tour"),
    slug: "medical-tourniquet",
    name: "Жгут медицинский",
    nameEn: "Medical Tourniquet",
    nameZh: "医用止血带",
    purpose: "Жгут для венепункции (взрослые / дети)",
    purposeEn: "Venipuncture tourniquet (adult / paediatric)",
    purposeZh: "静脉穿刺止血带(成人 / 儿童)",
    subcategory: "tourniquet",
    images: ["/images/products/zhgut-meditsinskii.webp", "/images/products/zhgut-meditsinskii-dlya-detei.jpg"],
    variantAttributes: [{ key: "size", label_ru: "Размер", label_en: "Size", label_zh: "规格" }],
    variants: [
      { catalogNumber: "840050", size: "adult", pack: "100/box" },
      { catalogNumber: "840051", size: "paediatric", pack: "100/box" },
    ],
  },
  {
    id: nextId("vac-trans"),
    slug: "vacuette-vtb-transport-container",
    name: "VACUETTE® Транспортный контейнер VTB",
    nameEn: "VACUETTE® VTB Transport Container",
    nameZh: "VACUETTE® VTB 运输容器",
    purpose: "Транспортный контейнер для пробирок (с/без коробки HK0190)",
    purposeEn: "Tube transport container (with or without HK0190 mailing box)",
    purposeZh: "试管运输容器(可选 HK0190 邮寄盒)",
    subcategory: "transport",
    images: ["/images/products/transportnyi-konteiner-vacuette-vtb-s-korobkoi-dlya-transportirovki-hk0190.webp", "/images/products/transportnyi-konteiner-vacuette-vtb-bez-korobki-dlya-transportirovki.webp"],
    variantAttributes: [{ key: "config", label_ru: "Комплект", label_en: "Configuration", label_zh: "配置" }],
    variants: [
      { catalogNumber: "472001", config: "with HK0190 mailing box" },
      { catalogNumber: "472040", config: "without box" },
    ],
  },
  {
    id: nextId("vac-trans"),
    slug: "vacuette-vtc-transport-container",
    name: "VACUETTE® Транспортный контейнер VTC (на 12 пробирок)",
    nameEn: "VACUETTE® VTC Transport Container (12 tubes)",
    nameZh: "VACUETTE® VTC 运输容器(12 管)",
    purpose: "Транспортный контейнер на 12 пробирок (с/без коробки HK0190)",
    purposeEn: "12-tube transport container (with or without HK0190)",
    purposeZh: "12 管运输容器(可选 HK0190)",
    subcategory: "transport",
    images: ["/images/products/transportnyi-konteiner-vacuette-vtc-s-korobkoi-dlya-transportirovki-hk0190.jpg", "/images/products/transportnyi-konteiner-vacuette-vtc-bez-korobki-dlya-transportirovki-hk0190.jpg"],
    variantAttributes: [{ key: "config", label_ru: "Комплект", label_en: "Configuration", label_zh: "配置" }],
    variants: [
      { catalogNumber: "800105", config: "with HK0190 mailing box" },
      { catalogNumber: "800110", config: "without box" },
    ],
  },
  {
    id: nextId("vac-trans"),
    slug: "vacuette-transport-accessories",
    name: "VACUETTE® Аксессуары для транспортировки",
    nameEn: "VACUETTE® Transport Accessories",
    nameZh: "VACUETTE® 运输配件",
    purpose: "Вкладыши, прокладки, хладоэлементы, штативы и почтовая коробка для VTB/VTC",
    purposeEn: "Inserts, pads, cold packs, racks and mailing box for VTB/VTC",
    purposeZh: "VTB/VTC 用内衬、衬垫、冷敷包、试管架与邮寄盒",
    subcategory: "transport",
    images: [
      "/images/products/seraya-poristaya-vkladka-dlya-transportnogo-konteinera-vacuette-vtb.webp",
      "/images/products/poristaya-vkladka-dlya-transportnogo-konteinera-vacuette-vtc-na-12-probirok.webp",
      "/images/products/gigroskopicheskaya-prokladka-dlya-transportnogo-konteinera-vacuette-vtb-i-vacuet.webp",
      "/images/products/hladoelement-dlya-transportnogo-konteinera-vacuette-vtb-220h120h11-mm-golubaya.webp",
      "/images/products/hladoelement-dlya-transportnogo-konteinera-vacuette-vtc-d-90-mm-golubaya.webp",
      "/images/products/korobka-dlya-otpravki-pochtoi-dlya-odnogo-transportnogo-konteinera-vacuette-vtb.webp",
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
  },
  {
    id: nextId("vac-trans"),
    slug: "vacuette-isotherm-bag",
    name: "Сумка Isotherm для контейнеров VACUETTE®",
    nameEn: "Isotherm Bag for VACUETTE® Transport Containers",
    nameZh: "VACUETTE® 运输容器恒温袋",
    purpose: "Изотермические сумки на 1–4 контейнера VTB или 1 контейнер VTC",
    purposeEn: "Insulated bags for 1–4 VTB or 1 VTC container",
    purposeZh: "可容纳 1–4 个 VTB 或 1 个 VTC",
    subcategory: "transport",
    images: [
      "/images/products/sumka-isotherm-dlya-odnogo-transportnogo-konteinera-vacuette-vtb.jpg",
      "/images/products/sumka-isotherm-dlya-dvuh-transportnyh-konteinerov-vacuette-vtb.webp",
      "/images/products/sumka-isotherm-dlya-treh-transportnyh-konteinerov-vacuette-vtb.webp",
      "/images/products/sumka-isotherm-dlya-chetyreh-transportnyh-konteinerov-vacuette-vtb.webp",
      "/images/products/sumka-isotherm-dlya-odnogo-transportnogo-konteinera-vacuette-vtc.webp",
    ],
    variantAttributes: [{ key: "capacity", label_ru: "Вместимость", label_en: "Capacity", label_zh: "容量" }],
    variants: [
      { catalogNumber: "472020", capacity: "1 × VTB" },
      { catalogNumber: "472030", capacity: "2 × VTB" },
      { catalogNumber: "472023", capacity: "3 × VTB" },
      { catalogNumber: "472024", capacity: "4 × VTB" },
      { catalogNumber: "472022", capacity: "1 × VTC" },
    ],
  },
];

for (const f of LEGACY_FAMILIES) {
  FAMILIES.push({
    id: f.id,
    slug: f.slug,
    name: f.name,
    shortDescription: f.purpose,
    description: f.purpose,
    categoryId: "vacuum-systems",
    subcategory: f.subcategory,
    additive: null,
    capColor: null,
    ringColor: null,
    images: f.images,
    variantAttributes: f.variantAttributes,
    variants: f.variants,
    specs: [],
    tags: [],
    featured: false,
    inStock: true,
    catalogNumber: f.variants[0]?.catalogNumber ?? "",
    manufacturer: "greiner-bio-one",
    createdAt: "2024-01-01",
    sort: FAMILIES.length,
    i18n: {
      en: { name: f.nameEn, shortDescription: f.purposeEn, description: f.purposeEn },
      zh: { name: f.nameZh, shortDescription: f.purposeZh, description: f.purposeZh },
    },
  });
}

writeFileSync(
  resolve(process.cwd(), "data/products/vacuum-systems.json"),
  JSON.stringify(FAMILIES, null, 2)
);

console.log(`Wrote ${FAMILIES.length} families with ${FAMILIES.reduce((s, f) => s + f.variants.length, 0)} variants`);
console.log("By subcategory:");
const bySub = {};
for (const f of FAMILIES) bySub[f.subcategory] = (bySub[f.subcategory] ?? 0) + 1;
console.log(bySub);
