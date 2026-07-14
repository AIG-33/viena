#!/usr/bin/env python3
"""Regenerate data/products/lancets.json into the family + variantAttributes +
variants model used by the shared variant configurator (same scheme as
vacuum-systems / consumables).

Source of truth is the *existing* lancets.json (RFN catalog numbers, gauge,
depth, per-size images and search keywords). We group every safety lancet SKU
into a single family "Ланцеты безопасные" and expose four differentiating
parameters that actually change the catalog number / RFN:

  - type   : product series / activation (encoded by the RFN prefix)
  - blade  : needle vs blade (17G/18G are heel-stick blades)
  - gauge  : needle gauge (G)
  - depth  : penetration depth (mm)

Grounding for the series prefixes (Lianfa / Linkfar safety lancets):
  04 -> Pressure-Activated (PA)        09 -> adjustable depth
  10 -> Pressure-Activated (Lite)      11 -> Pressure-Activated (PA2)
  12 -> push-button
(The names for 10/12 are best-effort; PA/PA2/adjustable are confirmed by the
manufacturer catalogue.)
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Raw per-SKU source (preserved so the generator is idempotent/re-runnable).
SRC = os.path.join(ROOT, "data", "source", "lancets-raw.json")
OUT = os.path.join(ROOT, "data", "products", "lancets.json")

TYPE_LABELS = {
    "04": {"ru": "Пресс-активируемый (PA)", "en": "Pressure-activated (PA)", "zh": "压力激活 (PA)"},
    "09": {"ru": "Регулируемая глубина", "en": "Adjustable depth", "zh": "可调深度"},
    "10": {"ru": "Пресс-активируемый (Lite)", "en": "Pressure-activated (Lite)", "zh": "压力激活 (Lite)"},
    "11": {"ru": "Пресс-активируемый (PA2)", "en": "Pressure-activated (PA2)", "zh": "压力激活 (PA2)"},
    "12": {"ru": "Нажимной (кнопочный)", "en": "Push-button", "zh": "按钮式"},
}
TYPE_ORDER = ["04", "09", "10", "11", "12"]

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

    variants = []
    for p in products:
        specs = {s["key"]: s["value"] for s in p.get("specs", [])}
        gauge = specs.get("Размер ланцета", "").strip()
        depth_raw = next(
            (v for k, v in specs.items() if "Глубина" in k), ""
        ).strip()
        gauge_num = int(re.sub(r"\D", "", gauge) or 0)

        rfn_raw = p.get("catalogNumber", "").strip()
        rfn = rfn_raw.split()[0]  # strip " (Blade)" suffix
        prefix = rfn.split("-")[0]

        is_blade = "(Blade)" in rfn_raw or gauge_num in (17, 18)

        variants.append(
            {
                "catalogNumber": rfn,
                "type": TYPE_LABELS.get(prefix, {"ru": prefix}).get("ru", prefix),
                "blade": BLADE_BLADE if is_blade else BLADE_NEEDLE,
                "gauge": gauge,
                "depth": norm_depth(depth_raw),
                "image": p["images"][0],
                "_prefix": prefix,
                "_gauge_num": gauge_num,
                "_depth_key": depth_sort_key(depth_raw),
                "_blade": is_blade,
            }
        )

    # Collision check: each (type, blade, gauge, depth) must map to one RFN.
    seen = {}
    collisions = []
    for v in variants:
        key = (v["type"], v["blade"], v["gauge"], v["depth"])
        if key in seen and seen[key] != v["catalogNumber"]:
            collisions.append((key, seen[key], v["catalogNumber"]))
        seen[key] = v["catalogNumber"]
    if collisions:
        print("COLLISIONS DETECTED:", file=sys.stderr)
        for key, a, b in collisions:
            print(f"  {key}: {a} vs {b}", file=sys.stderr)
        return 1

    # Sort: needle first, then series order, gauge asc, depth asc.
    variants.sort(
        key=lambda v: (
            v["_blade"],
            TYPE_ORDER.index(v["_prefix"]) if v["_prefix"] in TYPE_ORDER else 99,
            v["_gauge_num"],
            v["_depth_key"],
        )
    )

    default = variants[0]
    family_image = default["image"]

    # Strip helper keys.
    clean_variants = []
    for v in variants:
        clean_variants.append(
            {
                "catalogNumber": v["catalogNumber"],
                "type": v["type"],
                "blade": v["blade"],
                "gauge": v["gauge"],
                "depth": v["depth"],
                "image": v["image"],
            }
        )

    keywords = products[0].get("searchKeywords", []) if products else []
    extra_kw = [
        "пресс-активируемый ланцет",
        "ланцет PA",
        "ланцет PA2",
        "ланцет с регулируемой глубиной",
        "лезвийный ланцет",
        "скарификатор для пятки",
    ]
    for k in extra_kw:
        if k not in keywords:
            keywords.append(k)

    family = {
        "id": "lan-family-001",
        "slug": "lantsety-bezopasnye",
        "name": "Ланцеты безопасные Linkfar (Lianfa)",
        "shortDescription": "Безопасные одноразовые ланцеты и скарификаторы 17G–30G, глубина прокола 1,2–2,2 мм",
        "description": "Безопасные одноразовые ланцеты Linkfar (Lianfa) для забора капиллярной крови: пресс-активируемые серии PA, PA2 и Lite, с регулируемой глубиной и нажимные кнопочные. Игла полностью скрыта в корпусе, после срабатывания автоматически втягивается и блокируется, что исключает повторное использование и риск случайного травмирования. Диаметр иглы 17G–30G и глубина прокола 1,2–2,2 мм закрывают все сценарии — от щадящего капиллярного забора у новорождённых и педиатрии до забора большого объёма крови; лезвийные скарификаторы 17G/18G предназначены для пяточного прокола.",
        "categoryId": "lancets",
        "subcategory": "lantsety-bezopasnye",
        "images": [family_image],
        "specs": [
            {"key": "Подкатегория", "value": "Ланцеты безопасные"},
            {"key": "Производитель", "value": "Linkfar (Lianfa)"},
        ],
        "variantAttributes": [
            {"key": "gauge", "label_ru": "Размер иглы", "label_en": "Gauge", "label_zh": "针径"},
            {"key": "depth", "label_ru": "Глубина прокола", "label_en": "Penetration depth", "label_zh": "穿刺深度"},
            {"key": "type", "label_ru": "Тип / серия", "label_en": "Type / series", "label_zh": "类型 / 系列"},
            {"key": "blade", "label_ru": "Исполнение", "label_en": "Presentation", "label_zh": "结构"},
        ],
        "variants": clean_variants,
        "tags": [],
        "featured": True,
        "inStock": True,
        "catalogNumber": default["catalogNumber"],
        "manufacturer": "lianfa",
        "createdAt": "2024-01-01",
        "sort": 1,
        "i18n": {
            "en": {
                "name": "Safety lancets Linkfar (Lianfa)",
                "shortDescription": "Safety single-use lancets and blades 17G–30G, penetration depth 1.2–2.2 mm",
                "description": "Single-use safety lancets Linkfar (Lianfa) for capillary blood sampling: pressure-activated PA, PA2 and Lite series, adjustable-depth and push-button versions. The needle is fully shielded inside the body and retracts automatically after activation, preventing reuse and accidental injury. Gauges 17G–30G and 1.2–2.2 mm penetration depth cover every scenario — from gentle neonatal and pediatric sampling to high-volume collection; 17G/18G blades are intended for heel-stick sampling.",
            },
            "zh": {
                "name": "安全采血针 Linkfar (Lianfa)",
                "shortDescription": "一次性安全采血针与刀片式 17G–30G，穿刺深度 1.2–2.2 毫米",
                "description": "Linkfar (Lianfa) 一次性安全采血针，用于毛细血管采血：压力激活 PA、PA2 与 Lite 系列、可调深度及按钮式。针头完全隐藏于针体内，激活后自动回缩并锁定，防止重复使用和意外伤害。17G–30G 针径及 1.2–2.2 毫米穿刺深度覆盖各种场景——从温和的新生儿与儿科采血到大容量采集；17G/18G 刀片式用于足跟采血。",
            },
        },
        "searchKeywords": keywords,
    }

    json.dump([family], open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # Report
    print(f"OK: 1 family, {len(clean_variants)} SKUs")
    print(f"  default: {default['catalogNumber']} ({default['gauge']} / {default['depth']} / {default['type']})")
    from collections import Counter
    for attr in ("type", "blade", "gauge", "depth"):
        vals = Counter(v[attr] for v in clean_variants)
        print(f"  {attr}: {dict(vals)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
