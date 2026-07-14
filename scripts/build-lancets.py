#!/usr/bin/env python3
"""Regenerate data/products/lancets.json into the family + variantAttributes +
variants model used by the shared variant configurator (same scheme as
vacuum-systems / consumables).

Source of truth is the preserved raw per-SKU dump at
data/source/lancets-raw.json (RFN catalog numbers, gauge, depth, per-size
images and search keywords).

Grouping: ONE family (card) per product SERIES. The series is encoded by the
RFN prefix and is now the family identity (not a selectable parameter). Within
each family the remaining parameters stay selectable and switch the RFN /
specs / photo:

  - blade  : needle vs blade (17G/18G are heel-stick blades)
  - gauge  : needle gauge (G)
  - depth  : penetration depth (mm)

Series (Lianfa / Linkfar safety lancets):
  04 -> Pressure-Activated (PA)     [confirmed]
  11 -> Pressure-Activated (PA2)    [confirmed]
  09 -> adjustable depth            [confirmed]
  10 -> Pressure-Activated (Lite)   [best-effort name]
  12 -> push-button                 [best-effort name]

Collision check: within each family, every (blade, gauge, depth) combo must
map to exactly one RFN.
"""
import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Raw per-SKU source (preserved so the generator is idempotent/re-runnable).
SRC = os.path.join(ROOT, "data", "source", "lancets-raw.json")
OUT = os.path.join(ROOT, "data", "products", "lancets.json")

TYPE_ORDER = ["04", "09", "10", "11", "12"]

# Per-series family metadata. `confirmed` marks names taken from the
# manufacturer catalogue; the rest are sensible best-effort names.
SERIES = {
    "04": {
        "id": "lan-pa",
        "slug": "lantsety-bezopasnye-pa",
        "type_ru": "PA (пресс-активируемый)",
        "type_en": "PA (pressure-activated)",
        "type_zh": "PA（压力激活）",
        "name_ru": "Ланцеты безопасные, серия PA",
        "name_en": "Safety lancets, PA series",
        "name_zh": "安全采血针 PA 系列",
        "short_ru": "Пресс-активируемые безопасные ланцеты PA, 17G–30G, глубина 1,2–2,2 мм",
        "short_en": "Pressure-activated PA safety lancets, 17G–30G, depth 1.2–2.2 mm",
        "short_zh": "压力激活 PA 安全采血针，17G–30G，深度 1.2–2.2 毫米",
        "desc_ru": "Пресс-активируемые безопасные ланцеты Linkfar (Lianfa) серии PA — базовая линейка: срабатывают при прижатии к коже, игла полностью скрыта в корпусе и после срабатывания автоматически втягивается и блокируется. Включает игольчатые модели 21G–30G и лезвийные скарификаторы 17G/18G для пяточного прокола.",
        "desc_en": "Pressure-activated Linkfar (Lianfa) PA safety lancets — the base line: activated by pressing against the skin, the needle is fully shielded and retracts and locks automatically after use. Includes 21G–30G needle models and 17G/18G blades for heel-stick sampling.",
        "desc_zh": "Linkfar (Lianfa) PA 系列压力激活安全采血针——基础系列：贴皮加压即触发，针头完全隐藏于针体内，使用后自动回缩并锁定。包含 21G–30G 针式型号及用于足跟采血的 17G/18G 刀片式。",
    },
    "11": {
        "id": "lan-pa2",
        "slug": "lantsety-bezopasnye-pa2",
        "type_ru": "PA2 (пресс-активируемый, усиленный)",
        "type_en": "PA2 (pressure-activated, reinforced)",
        "type_zh": "PA2（压力激活，加强型）",
        "name_ru": "Ланцеты безопасные, серия PA2",
        "name_en": "Safety lancets, PA2 series",
        "name_zh": "安全采血针 PA2 系列",
        "short_ru": "Пресс-активируемые ланцеты PA2 с усиленным механизмом двойной пружины",
        "short_en": "Pressure-activated PA2 lancets with a reinforced double-spring mechanism",
        "short_zh": "带加强双弹簧机构的 PA2 压力激活采血针",
        "desc_ru": "Пресс-активируемые безопасные ланцеты Linkfar (Lianfa) серии PA2 — усиленный механизм двойной пружины обеспечивает более чёткое срабатывание и стабильную глубину прокола. Срабатывают при прижатии к коже, игла автоматически втягивается и блокируется после использования.",
        "desc_en": "Pressure-activated Linkfar (Lianfa) PA2 safety lancets — a reinforced double-spring mechanism delivers a crisper trigger and more consistent penetration depth. Activated on skin contact; the needle retracts and locks automatically after use.",
        "desc_zh": "Linkfar (Lianfa) PA2 系列压力激活安全采血针——加强双弹簧机构带来更利落的触发和更稳定的穿刺深度。贴皮触发，使用后针头自动回缩并锁定。",
    },
    "10": {
        "id": "lan-pa-lite",
        "slug": "lantsety-bezopasnye-pa-lite",
        "type_ru": "PA Lite (облегчённый)",
        "type_en": "PA Lite (lightweight)",
        "type_zh": "PA Lite（轻量型）",
        "name_ru": "Ланцеты безопасные, серия PA Lite",
        "name_en": "Safety lancets, PA Lite series",
        "name_zh": "安全采血针 PA Lite 系列",
        "short_ru": "Облегчённые пресс-активируемые ланцеты PA Lite с мягким проколом 1,0–2,2 мм",
        "short_en": "Lightweight pressure-activated PA Lite lancets with a soft 1.0–2.2 mm puncture",
        "short_zh": "轻量型 PA Lite 压力激活采血针，柔和穿刺 1.0–2.2 毫米",
        "desc_ru": "Облегчённые пресс-активируемые безопасные ланцеты Linkfar (Lianfa) серии PA Lite — компактный корпус и мягкий прокол с диапазоном глубины 1,0–2,2 мм для комфортного капиллярного забора. Игла автоматически втягивается и блокируется после срабатывания. (Название серии — рабочее.)",
        "desc_en": "Lightweight pressure-activated Linkfar (Lianfa) PA Lite safety lancets — a compact body and soft puncture with a 1.0–2.2 mm depth range for comfortable capillary sampling. The needle retracts and locks automatically after activation. (Series name is best-effort.)",
        "desc_zh": "Linkfar (Lianfa) PA Lite 系列轻量型压力激活安全采血针——紧凑针体，柔和穿刺，深度范围 1.0–2.2 毫米，采血更舒适。激活后针头自动回缩并锁定。（系列名称为暂定。）",
    },
    "09": {
        "id": "lan-adjustable",
        "slug": "lantsety-bezopasnye-reguliruemye",
        "type_ru": "С регулируемой глубиной",
        "type_en": "Adjustable depth",
        "type_zh": "可调深度",
        "name_ru": "Ланцеты безопасные с регулируемой глубиной",
        "name_en": "Adjustable-depth safety lancets",
        "name_zh": "可调深度安全采血针",
        "short_ru": "Безопасные ланцеты с регулируемой глубиной прокола под тип кожи и объём крови",
        "short_en": "Safety lancets with adjustable penetration depth for skin type and blood volume",
        "short_zh": "可调穿刺深度安全采血针，适配肤质与采血量",
        "desc_ru": "Безопасные ланцеты Linkfar (Lianfa) с регулируемой глубиной прокола — несколько ступеней глубины позволяют точно подобрать прокол под тип кожи и требуемый объём крови. Игла полностью скрыта, стерильна и после срабатывания блокируется, исключая повторное использование.",
        "desc_en": "Adjustable-depth Linkfar (Lianfa) safety lancets — several depth steps let you match the puncture precisely to skin type and required blood volume. The needle is fully shielded, sterile, and locks after activation to prevent reuse.",
        "desc_zh": "Linkfar (Lianfa) 可调深度安全采血针——多档深度可根据肤质和所需采血量精确匹配穿刺。针头完全隐藏、无菌，激活后锁定，防止重复使用。",
    },
    "12": {
        "id": "lan-push-button",
        "slug": "lantsety-bezopasnye-nazhimnye",
        "type_ru": "Нажимной (кнопочный)",
        "type_en": "Push-button",
        "type_zh": "按钮式",
        "name_ru": "Ланцеты безопасные, нажимные (кнопочные)",
        "name_en": "Push-button safety lancets",
        "name_zh": "按钮式安全采血针",
        "short_ru": "Нажимные кнопочные безопасные ланцеты — прокол по нажатию кнопки",
        "short_en": "Push-button safety lancets — puncture triggered by a button press",
        "short_zh": "按钮式安全采血针——按下按钮即触发穿刺",
        "desc_ru": "Нажимные (кнопочные) безопасные ланцеты Linkfar (Lianfa) — прокол выполняется по нажатию кнопки, что даёт контроль над моментом срабатывания без прижатия к коже. Игла автоматически втягивается и блокируется после использования. (Название серии — рабочее.)",
        "desc_en": "Push-button Linkfar (Lianfa) safety lancets — the puncture is triggered by pressing a button, giving control over the moment of activation without pressing on the skin. The needle retracts and locks automatically after use. (Series name is best-effort.)",
        "desc_zh": "Linkfar (Lianfa) 按钮式安全采血针——按下按钮即触发穿刺，无需贴皮加压即可掌控触发时机。使用后针头自动回缩并锁定。（系列名称为暂定。）",
    },
}

BLADE_NEEDLE = "Игольчатый"
BLADE_BLADE = "Лезвийный (скарификатор)"


def norm_depth(raw: str) -> str:
    """"1.0-2.2" -> "1,0–2,2 мм", "2.2" -> "2,2 мм"."""
    s = raw.strip().replace(".", ",")
    s = s.replace("-", "–")
    return f"{s} мм"


def depth_sort_key(raw: str) -> float:
    m = re.search(r"(\d+[.,]\d+)", raw)
    return float(m.group(1).replace(",", ".")) if m else 0.0


def main() -> int:
    products = json.load(open(SRC, encoding="utf-8"))

    base_keywords = products[0].get("searchKeywords", []) if products else []
    extra_kw = [
        "пресс-активируемый ланцет",
        "ланцет PA",
        "ланцет PA2",
        "ланцет с регулируемой глубиной",
        "лезвийный ланцет",
        "скарификатор для пятки",
    ]
    keywords = list(base_keywords)
    for k in extra_kw:
        if k not in keywords:
            keywords.append(k)

    # Bucket raw SKUs by series prefix.
    buckets: dict[str, list[dict]] = {}
    for p in products:
        specs = {s["key"]: s["value"] for s in p.get("specs", [])}
        gauge = specs.get("Размер ланцета", "").strip()
        depth_raw = next((v for k, v in specs.items() if "Глубина" in k), "").strip()
        gauge_num = int(re.sub(r"\D", "", gauge) or 0)

        rfn_raw = p.get("catalogNumber", "").strip()
        rfn = rfn_raw.split()[0]  # strip " (Blade)" suffix
        prefix = rfn.split("-")[0]
        is_blade = "(Blade)" in rfn_raw or gauge_num in (17, 18)

        buckets.setdefault(prefix, []).append(
            {
                "catalogNumber": rfn,
                "blade": BLADE_BLADE if is_blade else BLADE_NEEDLE,
                "gauge": gauge,
                "depth": norm_depth(depth_raw),
                "image": p["images"][0],
                "_gauge_num": gauge_num,
                "_depth_key": depth_sort_key(depth_raw),
                "_blade": is_blade,
            }
        )

    unknown = [pfx for pfx in buckets if pfx not in SERIES]
    if unknown:
        print(f"UNKNOWN series prefixes (no metadata): {unknown}", file=sys.stderr)
        return 1

    families = []
    total_skus = 0
    ordered = [p for p in TYPE_ORDER if p in buckets] + [
        p for p in buckets if p not in TYPE_ORDER
    ]
    for sort_idx, prefix in enumerate(ordered, start=1):
        meta = SERIES[prefix]
        vlist = buckets[prefix]

        # Collision check within the family: (blade, gauge, depth) -> one RFN.
        seen = {}
        collisions = []
        for v in vlist:
            key = (v["blade"], v["gauge"], v["depth"])
            if key in seen and seen[key] != v["catalogNumber"]:
                collisions.append((key, seen[key], v["catalogNumber"]))
            seen[key] = v["catalogNumber"]
        if collisions:
            print(f"COLLISIONS in series {prefix}:", file=sys.stderr)
            for key, a, b in collisions:
                print(f"  {key}: {a} vs {b}", file=sys.stderr)
            return 1

        # Sort: needle first, gauge asc, depth asc.
        vlist.sort(key=lambda v: (v["_blade"], v["_gauge_num"], v["_depth_key"]))
        default = vlist[0]

        clean_variants = [
            {
                "catalogNumber": v["catalogNumber"],
                "blade": v["blade"],
                "gauge": v["gauge"],
                "depth": v["depth"],
                "image": v["image"],
            }
            for v in vlist
        ]
        total_skus += len(clean_variants)

        families.append(
            {
                "id": meta["id"],
                "slug": meta["slug"],
                "name": meta["name_ru"],
                "shortDescription": meta["short_ru"],
                "description": meta["desc_ru"],
                "categoryId": "lancets",
                "subcategory": meta["slug"],
                "images": [default["image"]],
                "specs": [
                    {"key": "Подкатегория", "value": "Ланцеты безопасные"},
                    {"key": "Тип / серия", "value": meta["type_ru"]},
                    {"key": "Производитель", "value": "Linkfar (Lianfa)"},
                ],
                "variantAttributes": [
                    {"key": "gauge", "label_ru": "Размер иглы", "label_en": "Gauge", "label_zh": "针径"},
                    {"key": "depth", "label_ru": "Глубина прокола", "label_en": "Penetration depth", "label_zh": "穿刺深度"},
                    {"key": "blade", "label_ru": "Исполнение", "label_en": "Presentation", "label_zh": "结构"},
                ],
                "variants": clean_variants,
                "tags": [],
                "featured": prefix in ("04", "11"),
                "inStock": True,
                "catalogNumber": default["catalogNumber"],
                "manufacturer": "lianfa",
                "createdAt": "2024-01-01",
                "sort": sort_idx,
                "i18n": {
                    "en": {
                        "name": meta["name_en"],
                        "shortDescription": meta["short_en"],
                        "description": meta["desc_en"],
                    },
                    "zh": {
                        "name": meta["name_zh"],
                        "shortDescription": meta["short_zh"],
                        "description": meta["desc_zh"],
                    },
                },
                "searchKeywords": keywords,
            }
        )

    json.dump(families, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # Report
    print(f"OK: {len(families)} families, {total_skus} SKUs")
    for f in families:
        vs = f["variants"]
        blades = Counter(v["blade"] for v in vs)
        print(
            f"  [{f['sort']}] {f['id']:<16} {len(vs):>2} SKU  "
            f"default={f['catalogNumber']:<8} "
            f"blade={dict(blades)}  :: {f['name']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
