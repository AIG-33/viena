#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build data/products/consumables.json from the Huida grouping spreadsheet.

Model (mirrors vacuum-systems): every subcategory becomes a *family* Product
with `variantAttributes` (the parameters that change the catalog number) and a
`variants[]` list. Each Excel row is one variant carrying its catalog number
(RFN), the parsed attribute values, its source name and its photo.

Run:  python3 scripts/build-consumables.py
Input:  data/source/consumables-grouping.xlsx  +  data/source/photo-ext.json
Output: data/products/consumables.json
"""
import json
import os
import re
import sys

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "data", "source", "consumables-grouping.xlsx")
PHOTO_EXT = os.path.join(ROOT, "data", "source", "photo-ext.json")
OUT = os.path.join(ROOT, "data", "products", "consumables.json")

with open(PHOTO_EXT) as fh:
    PHOTO_EXT_MAP = {int(k): v for k, v in json.load(fh).items()}


def photo_path(photo_label):
    m = re.search(r"(\d+)", photo_label or "")
    if not m:
        return None
    n = int(m.group(1))
    ext = PHOTO_EXT_MAP.get(n)
    if not ext:
        return None
    return f"/images/products/huida/foto-{n}.{ext}"


# ---------------------------------------------------------------------------
# Attribute parsing
# ---------------------------------------------------------------------------
def norm_num(s):
    return s.replace(",", ".")


def parse_volume(name):
    m = re.search(r"(\d+(?:[.,]\d+)?)\s*(мкл|мл)", name)
    if not m:
        return None
    return f"{m.group(1)} {m.group(2)}"


def volume_sort_key(v):
    if not v:
        return (9, 0.0)
    m = re.match(r"([\d.,]+)\s*(мкл|мл)", v)
    if not m:
        return (9, 0.0)
    num = float(norm_num(m.group(1)))
    unit_rank = 0 if m.group(2) == "мкл" else 1
    return (unit_rank, num)


def parse_attrs(name, sub, grp, cat=""):
    """Return an ordered dict {key: value} of parsed attributes for a row.

    Only meaningful keys per subcategory are populated. The caller keeps
    just the attributes that actually vary inside the family.
    """
    n = name
    low = name.lower()
    a = {}

    is_tip = "наконечник" in low
    is_tube = ("пробирка" in low) or ("пробирке" in low)
    is_plate = "планшет" in low
    is_urine_bag = sub == "Мочеприемники"
    is_container = sub == "Контейнеры для мочи"
    is_swab = "сваб" in low

    # --- dispenser / platform type (Eppendorf, Gilson, Thermofisher, Tecan…) ---
    m = re.search(r"тип\s+([A-Za-zА-Яа-я]+)", n)
    if m:
        a["type"] = m.group(1)

    # --- EDTA anticoagulant ---
    m = re.search(r"\b(K2EDTA|K3EDTA)\b", n)
    if m:
        a["edta"] = m.group(1)

    # --- volume (мкл/мл, or plate "96*0,2" grid notation) ---
    vol = parse_volume(n)
    if not vol:
        m = re.search(r"96\s*[*x×]\s*(\d+(?:[.,]\d+)?)", n)
        if m:
            vol = f"{m.group(1)} мл"
    if vol:
        a["volume"] = vol

    # --- filter (tips) ---
    if is_tip:
        a["filter"] = "С фильтром" if "фильтр" in low else "Без фильтра"

    # --- conductive (automated tips) ---
    if sub == "Наконечники для автоматизированных систем":
        a["conductive"] = "Токопроводящий" if "токопровод" in low else "Обычный"

    # --- format: PCR tube single / strip ---
    if sub == "ПЦР-пробирки" or "стрип" in low:
        m = re.search(r"в стрипах по\s*(\d+)", low)
        if m:
            a["format"] = f"Стрип по {m.group(1)}"
        else:
            a["format"] = "Одиночная"

    # --- tip pack / mount ---
    if is_tip and sub != "Наконечники для автоматизированных систем":
        if "в штативе" in low:
            a["pack"] = "В штативе"
        elif "россыпью" in low:
            a["pack"] = "Россыпью"
    if sub == "Наконечники для автоматизированных систем":
        m = re.search(r"\((\d+(?:\*\d+)?)\s*шт\.?\s*в штативе\)", low)
        if m:
            a["pack"] = m.group(1).replace("*", "×") + " в штативе"

    # --- design (tubes) ---
    if is_tube and not is_swab:
        if "тонкостенн" in low:
            a["design"] = "Тонкостенная"
        elif "выпукл" in low:
            a["design"] = "Выпуклая крышка"
        elif "safe-lock" in low:
            a["design"] = "Safe-Lock"

    # --- plastic comb accessory (lives in the deep-well group) ---
    if "гребенка" in low or "гребёнка" in low:
        a["design"] = "Пластиковая гребёнка"

    # --- capillary (EDTA micro tubes) ---
    if sub == "Микропробирки с EDTA":
        if "без капилляра" in low:
            a["capillary"] = "Без капилляра"
        elif "прокалываемой крышкой" in low:
            a["capillary"] = "Капилляр, прокалываемая крышка"
        elif "двойной крышкой" in low:
            a["capillary"] = "Капилляр, двойная крышка"
        a["pack"] = "Индивидуальная" if "инд.уп" in low or "винд.уп" in low else "Стандартная"

    # --- plate skirt / geometry ---
    if is_plate:
        if "без юбки" in low:
            a["skirt"] = "Без юбки"
        elif "полуюбк" in low:
            a["skirt"] = "С полуюбкой"
        elif "с юбкой" in low:
            a["skirt"] = "С юбкой"
        wells = []
        if "квад.лунка" in low:
            wells.append("квадратная лунка")
        if "кругл.лунка" in low:
            wells.append("круглая лунка")
        if "кон.дно" in low:
            wells.append("коническое дно")
        if "кругл.дно" in low:
            wells.append("круглое дно")
        if wells:
            a["well"] = ", ".join(wells).capitalize()
        if "марк" in low:
            a["marking"] = "Чёрная маркировка"

    # --- urine bag mount + valve + tube length ---
    if is_urine_bag:
        if "недренируемый" in low:
            a["valve"] = "Недренируемый"
        elif "т-образн" in low:
            a["valve"] = "Т-образный клапан"
        elif "вытяжн" in low:
            a["valve"] = "Вытяжной клапан"
        elif "винтов" in low:
            a["valve"] = "Винтовой клапан"
        elif "педиатрический" in low:
            a["valve"] = "Педиатрический"
        if "педиатрический" in low:
            a["mount"] = "Педиатрический"
        elif "прикроватный" in low:
            a["mount"] = "Прикроватный"
        elif "ножной" in low:
            a["mount"] = "Ножной"
        else:
            a["mount"] = "Стандартный"
        # The "LS" SKU suffix always denotes the 30 cm tube even when the
        # source name forgot to spell it out.
        if "длина трубки 30" in low or cat.upper().endswith("LS"):
            a["tubeLength"] = "30 см"
        else:
            a["tubeLength"] = "Стандартная"

    # --- container port + material ---
    if is_container:
        a["port"] = "С портом отбора" if "портом" in low else "Без порта"
        if re.search(r",\s*PS\b", n):
            a["material"] = "PS"

    # --- swab stick / head / breakpoint / pack / medium ---
    if is_swab:
        if "деревянная палочка" in low:
            a["stick"] = "Деревянная"
        elif "ps-" in low or "ps -" in low:
            a["stick"] = "PS"
        elif "pp-палочка" in low:
            a["stick"] = "PP"
        elif "abs-палочка" in low:
            a["stick"] = "ABS"
        if "хлопковая головка" in low:
            a["head"] = "Хлопковая"
        elif "вискозная головка" in low:
            a["head"] = "Вискозная"
        elif "флокированная головка" in low:
            a["head"] = "Флокированная"
        m = re.search(r"точка надлома\s*([\d]+\s*см(?:\+\d+\s*см)?)", low)
        if m:
            a["breakpoint"] = m.group(1).replace(" ", "")
        # anatomical zone
        if "назофаринг" in low:
            a["zone"] = "Назофарингеальный"
        elif "орофаринг" in low:
            a["zone"] = "Орофарингеальный"
        # transport medium
        if "амиеса и углем" in low:
            a["medium"] = "Амиес + уголь"
        elif "амиеса" in low:
            a["medium"] = "Амиес"
        elif "кэри блэр" in low:
            a["medium"] = "Кэри-Блэр"
        elif "стюарта и углем" in low:
            a["medium"] = "Стюарт + уголь"
        elif "стюарта" in low:
            a["medium"] = "Стюарт"
        # swab packaging
        if "россыпью" in low:
            a["pack"] = "Россыпью"
        else:
            m = re.search(r"(\d+)\s*шт\.?/упак", low)
            if m:
                extra = ""
                mm = re.search(r"\((полиэтилен|блистер)\)", low)
                if mm:
                    extra = f" ({mm.group(1)})"
                a["pack"] = f"{m.group(1)} шт./уп.{extra}"

    # --- graduation (tips) ---
    if is_tip:
        a["graduation"] = "С градуировкой" if "градуировк" in low else "Без градуировки"

    # --- length (extended tips) ---
    if is_tip:
        a["length"] = "Удлинённый" if "удлин" in low else "Стандартный"

    # --- low binding (tips) ---
    if is_tip:
        a["binding"] = "Низкое связывание" if "низкое связывание" in low else "Стандартное связывание"

    # --- color ---
    if re.search(r"\bбел(ый|ая|ые)\b", low):
        a["color"] = "Белый"
    elif re.search(r"\bжёлт|желт", low):
        a["color"] = "Жёлтый"
    elif re.search(r"\bголуб", low):
        a["color"] = "Голубой"
    elif re.search(r"\bзелён|зелен", low):
        a["color"] = "Зелёный"

    # --- sterility (last, generic) ---
    if "нестерильн" in low:
        a["sterility"] = "Нестерильный"
    elif "стерильн" in low:
        a["sterility"] = "Стерильный"

    return a


# Attribute label dictionary (ru / en / zh) + display order priority.
ATTR_LABELS = {
    "type":        ("Тип",               "Type",            "型号"),
    "edta":        ("Антикоагулянт",     "Anticoagulant",   "抗凝剂"),
    "volume":      ("Объём",             "Volume",          "容量"),
    "filter":      ("Фильтр",            "Filter",          "滤芯"),
    "format":      ("Формат",            "Format",          "规格"),
    "design":      ("Исполнение",        "Design",          "结构"),
    "capillary":   ("Капилляр",          "Capillary",       "毛细管"),
    "valve":       ("Клапан",            "Valve",           "阀门"),
    "skirt":       ("Юбка",              "Skirt",           "裙边"),
    "marking":     ("Маркировка",        "Marking",         "标记"),
    "well":        ("Геометрия лунок",   "Well geometry",   "孔型"),
    "mount":       ("Исполнение",        "Style",           "款式"),
    "tubeLength":  ("Длина трубки",      "Tube length",     "管长"),
    "port":        ("Порт отбора",       "Sampling port",   "取样口"),
    "material":    ("Материал",          "Material",        "材料"),
    "zone":        ("Зона забора",       "Sampling zone",   "采样部位"),
    "stick":       ("Палочка",           "Shaft",           "杆材"),
    "head":        ("Головка",           "Tip head",        "拭子头"),
    "breakpoint":  ("Точка надлома",     "Breakpoint",      "折断点"),
    "medium":      ("Транспортная среда","Transport medium","运输培养基"),
    "conductive":  ("Проводимость",      "Conductivity",    "导电性"),
    "graduation":  ("Градуировка",       "Graduation",      "刻度"),
    "length":      ("Длина",             "Length",          "长度"),
    "color":       ("Цвет",              "Colour",          "颜色"),
    "pack":        ("Упаковка",          "Packaging",       "包装"),
    "sterility":   ("Стерильность",      "Sterility",       "灭菌"),
    "binding":     ("Связывание",        "Binding",         "结合力"),
}

ATTR_ORDER = [
    "type", "edta", "valve", "volume", "filter", "format", "design", "capillary",
    "skirt", "marking", "well", "mount", "zone", "port", "material", "stick",
    "head", "breakpoint", "medium", "conductive", "color", "graduation",
    "length", "binding", "tubeLength", "pack", "sterility",
]

# When an attribute is present on *some* rows of a family but absent on
# others, the absence is itself a meaningful choice — fill it with the
# neutral default so the parameter shows up in the configurator.
ATTR_DEFAULTS = {
    "type": "Универсальный",
    "filter": "Без фильтра",
    "color": "Натуральный",
    "design": "Стандартная",
    "sterility": "Нестерильный",
    "graduation": "Без градуировки",
    "length": "Стандартный",
    "binding": "Стандартное связывание",
    "conductive": "Обычный",
    "format": "Одиночная",
    "skirt": "Без юбки",
    "marking": "Без маркировки",
    "well": "Стандартная",
    "mount": "Стандартный",
    "tubeLength": "Стандартная",
    "port": "Без порта",
    "material": "PP",
    "valve": "—",
    "zone": "Общий",
    "capillary": "—",
    "pack": "—",
    "medium": "—",
    "stick": "—",
    "head": "—",
    "breakpoint": "—",
    "volume": "—",
}

# Family metadata keyed by (subcategory, group-bucket). Group-bucket lets us
# split the self-adhesive film out of the PCR-plates family.
FAMILIES = {
    "ПЦР-пробирки": {
        "slug": "pcr-probirki",
        "name": ("ПЦР-пробирки", "PCR tubes", "PCR 管"),
        "short": ("Тонкостенные ПЦР-пробирки и стрипы, 0,1–0,5 мл",
                  "Thin-wall PCR tubes and strips, 0.1–0.5 ml",
                  "薄壁 PCR 管与连管,0.1–0.5 毫升"),
    },
    "Микроцентрифужные пробирки": {
        "slug": "mikrocentrifuzhnye-probirki",
        "name": ("Микроцентрифужные пробирки", "Microcentrifuge tubes", "微量离心管"),
        "short": ("Полипропиленовые микроцентрифужные пробирки 0,2–7 мл",
                  "Polypropylene microcentrifuge tubes 0.2–7 ml",
                  "聚丙烯微量离心管 0.2–7 毫升"),
    },
    "Микропробирки с EDTA": {
        "slug": "mikroprobirki-edta",
        "name": ("Микропробирки с EDTA", "EDTA microtubes", "EDTA 微量采血管"),
        "short": ("Микропробирки K2EDTA/K3EDTA для гематологии, с капилляром и без",
                  "K2EDTA/K3EDTA haematology microtubes, with or without capillary",
                  "用于血液学的 K2EDTA/K3EDTA 微量管,含/不含毛细管"),
    },
    "Наконечники для ПЦР": {
        "slug": "nakonechniki-pcr",
        "name": ("Наконечники для дозаторов", "Pipette tips", "移液器吸头"),
        "short": ("Наконечники россыпью и в штативе, с фильтром и без, 10–1000 мкл",
                  "Bulk and racked pipette tips, filtered and non-filtered, 10–1000 µl",
                  "散装与盒装吸头,含/不含滤芯,10–1000 微升"),
    },
    "Наконечники": {
        "slug": "nakonechniki-universalnye",
        "name": ("Наконечники универсальные", "Universal pipette tips", "通用移液吸头"),
        "short": ("Универсальные наконечники под дозаторы Eppendorf, Gilson, Finland, Dalong",
                  "Universal tips for Eppendorf, Gilson, Finland, Dalong pipettes",
                  "适配 Eppendorf、Gilson、Finland、Dalong 移液器的通用吸头"),
    },
    "Наконечники для автоматизированных систем": {
        "slug": "nakonechniki-avtomatizirovannye",
        "name": ("Наконечники для автоматических систем", "Tips for automated systems", "自动化系统吸头"),
        "short": ("Наконечники для платформ Tecan и Hamilton, проводящие и обычные",
                  "Tips for Tecan and Hamilton platforms, conductive and standard",
                  "适用于 Tecan 与 Hamilton 平台的吸头,导电与普通型"),
    },
    "ПЦР-планшеты": {
        "slug": "pcr-planshety",
        "name": ("ПЦР-планшеты", "PCR plates", "PCR 板"),
        "short": ("96-луночные ПЦР-планшеты 0,1 и 0,2 мл, с юбкой и без",
                  "96-well PCR plates 0.1 and 0.2 ml, skirted and non-skirted",
                  "96 孔 PCR 板 0.1 与 0.2 毫升,带裙边与无裙边"),
    },
    "Плёнки для планшетов": {
        "slug": "plenki-dlya-planshetov",
        "name": ("Плёнки для планшетов", "Plate sealing films", "封板膜"),
        "short": ("Самоклеящаяся плёнка для герметизации ПЦР-планшетов",
                  "Self-adhesive film for sealing PCR plates",
                  "用于密封 PCR 板的自粘封膜"),
    },
    "Глубоколуночные ПЦР-планшеты": {
        "slug": "gluboko-lunochnye-planshety",
        "name": ("Глубоколуночные планшеты", "Deep-well plates", "深孔板"),
        "short": ("96-луночные глубоколуночные планшеты 0,5–2,2 мл",
                  "96 deep-well plates 0.5–2.2 ml",
                  "96 深孔板 0.5–2.2 毫升"),
    },
    "Контейнеры для мочи": {
        "slug": "konteinery-dlya-mochi",
        "name": ("Контейнеры для мочи", "Urine containers", "尿液容器"),
        "short": ("Контейнеры для сбора мочи 60–250 мл, стерильные и нестерильные",
                  "Urine collection containers 60–250 ml, sterile and non-sterile",
                  "尿液收集容器 60–250 毫升,无菌与非无菌"),
    },
    "Мочеприемники": {
        "slug": "mochepriemniki",
        "name": ("Мочеприёмники", "Urine bags", "集尿袋"),
        "short": ("Мочеприёмники 100–2000 мл с разными типами клапанов",
                  "Urine drainage bags 100–2000 ml with various valve types",
                  "集尿袋 100–2000 毫升,多种阀门类型"),
    },
    "Свабы без пробирки": {
        "slug": "svaby-bez-probirki",
        "name": ("Свабы без пробирки", "Swabs (no tube)", "拭子(不含试管)"),
        "short": ("Стерильные зонд-тампоны без пробирки, разные палочки и головки",
                  "Sterile swabs without tube, various shafts and heads",
                  "不含试管的无菌拭子,多种杆材与拭子头"),
    },
    "Свабы орофарингеальные": {
        "slug": "svaby-orofaringealnye",
        "name": ("Свабы орофарингеальные", "Oropharyngeal swabs", "口咽拭子"),
        "short": ("Флокированные орофарингеальные свабы с точкой надлома",
                  "Flocked oropharyngeal swabs with breakpoint",
                  "带折断点的植绒口咽拭子"),
    },
    "Свабы назофарингеальные": {
        "slug": "svaby-nazofaringealnye",
        "name": ("Свабы назофарингеальные", "Nasopharyngeal swabs", "鼻咽拭子"),
        "short": ("Флокированные назофарингеальные свабы с точкой надлома",
                  "Flocked nasopharyngeal swabs with breakpoint",
                  "带折断点的植绒鼻咽拭子"),
    },
    "Свабы в пробирке": {
        "slug": "svaby-v-probirke",
        "name": ("Свабы в пробирке", "Swabs in tube", "试管拭子"),
        "short": ("Стерильные свабы в пробирке, разные палочки, головки и упаковка",
                  "Sterile swabs in tube, various shafts, heads and packaging",
                  "试管装无菌拭子,多种杆材、拭子头与包装"),
    },
    "Свабы с транспортной средой": {
        "slug": "svaby-s-transportnoi-sredoi",
        "name": ("Свабы с транспортной средой", "Swabs with transport medium", "含运输培养基拭子"),
        "short": ("Свабы в пробирке со средами Амиеса, Стюарта, Кэри-Блэр",
                  "Swabs in tube with Amies, Stuart, Cary-Blair media",
                  "含 Amies、Stuart、Cary-Blair 培养基的试管拭子"),
    },
}

BASE_KEYWORDS = [
    "лабораторные расходные материалы", "расходники для лаборатории",
    "расходные материалы для медицинской лаборатории", "пластиковая лабораторная посуда",
    "медицинские расходные материалы", "одноразовые расходные материалы",
    "расходники для ПЦР", "стерильные расходные материалы",
    "купить расходники для лаборатории", "lab consumables", "Huida",
]


def slugify_family(sub):
    return FAMILIES[sub]["slug"]


def family_bucket(sub, grp):
    """Route the self-adhesive film into its own family."""
    if sub == "ПЦР-планшеты" and "Пленка" in (grp or ""):
        return "Плёнки для планшетов"
    return sub


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["Группировка"]
    rows = []
    cur_sub = ""
    cur_grp = ""
    for i, r in enumerate(ws.iter_rows(values_only=True), 1):
        if i == 1:
            continue
        sub, grp, cat, name, desc, photo = r
        if sub:
            cur_sub = sub.strip()
            cur_grp = ""
        if grp:
            cur_grp = grp.strip()
        if not cat and not name:
            continue
        rows.append({
            "sub": cur_sub,
            "grp": cur_grp,
            "cat": (cat or "").strip(),
            "name": (name or "").strip(),
            "desc": (desc or "").strip(),
            "photo": (photo or "").strip(),
        })

    # Bucket rows into families.
    families = {}
    order = []
    for r in rows:
        fam = family_bucket(r["sub"], r["grp"])
        if fam not in families:
            families[fam] = []
            order.append(fam)
        families[fam].append(r)

    products = []
    problems = []
    for idx, fam in enumerate(order, 1):
        meta = FAMILIES[fam]
        fam_rows = families[fam]

        parsed = []
        for r in fam_rows:
            attrs = parse_attrs(r["name"], r["sub"], r["grp"], r["cat"])
            parsed.append((r, attrs))

        # Keys present on at least one row become mandatory for the family;
        # fill their absence with the neutral default so presence/absence
        # counts as a real variation (e.g. white vs natural, safe-lock vs plain).
        keys_present = set()
        for _, attrs in parsed:
            keys_present.update(attrs.keys())
        for _, attrs in parsed:
            for k in keys_present:
                if k not in attrs:
                    attrs[k] = ATTR_DEFAULTS.get(k, "—")

        # Determine which attributes actually vary within the family.
        value_sets = {}
        for _, attrs in parsed:
            for k, v in attrs.items():
                value_sets.setdefault(k, set()).add(v)
        varying = [k for k in ATTR_ORDER if k in value_sets and len(value_sets[k]) > 1]

        # Constant attributes -> family-level specs.
        constant = {
            k: next(iter(value_sets[k]))
            for k in ATTR_ORDER
            if k in value_sets and len(value_sets[k]) == 1
        }

        # Build variants using varying attributes; ensure uniqueness.
        def tuple_for(attrs):
            return tuple(attrs.get(k, "") for k in varying)

        seen = {}
        for r, attrs in parsed:
            seen.setdefault(tuple_for(attrs), []).append(r["cat"])
        collisions = {t: c for t, c in seen.items() if len(c) > 1}
        if collisions:
            problems.append((fam, collisions))

        variants = []
        for r, attrs in parsed:
            v = {"catalogNumber": r["cat"], "sourceName": r["name"]}
            for k in varying:
                if k in attrs:
                    v[k] = attrs[k]
            img = photo_path(r["photo"])
            if img:
                v["image"] = img
            if r["desc"]:
                v["pack_note"] = r["desc"]
            variants.append(v)

        # Sort variants for a sensible default (by attribute order).
        def variant_sort_key(v):
            key = []
            for k in varying:
                if k == "volume":
                    key.append(volume_sort_key(v.get(k)))
                else:
                    key.append((0, v.get(k) or ""))
            return key

        variants.sort(key=variant_sort_key)

        # variantAttributes with sorted value display order per attribute.
        variant_attributes = []
        for k in varying:
            ru, en, zh = ATTR_LABELS[k]
            variant_attributes.append({
                "key": k,
                "label_ru": ru,
                "label_en": en,
                "label_zh": zh,
            })

        # Family image: most common photo among variants.
        from collections import Counter
        photo_counter = Counter(v.get("image") for v in variants if v.get("image"))
        family_image = photo_counter.most_common(1)[0][0] if photo_counter else None
        images = [family_image] if family_image else []

        # Family-level specs from constant attributes + subcategory.
        specs = [{"key": "Подкатегория", "value": fam if fam in FAMILIES else fam}]
        for k, val in constant.items():
            ru, _, _ = ATTR_LABELS[k]
            specs.append({"key": ru, "value": val})

        name_ru, name_en, name_zh = meta["name"]
        short_ru, short_en, short_zh = meta["short"]

        product = {
            "id": f"cons-{idx:03d}",
            "slug": meta["slug"],
            "name": name_ru,
            "shortDescription": short_ru,
            "description": short_ru,
            "categoryId": "consumables",
            "subcategory": meta["slug"],
            "images": images,
            "specs": specs,
            "variantAttributes": variant_attributes,
            "variants": variants,
            "tags": [],
            "featured": idx <= 4,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "huida",
            "createdAt": "2024-01-01",
            "sort": idx,
            "i18n": {
                "en": {"name": name_en, "shortDescription": short_en, "description": short_en},
                "zh": {"name": name_zh, "shortDescription": short_zh, "description": short_zh},
            },
            "searchKeywords": BASE_KEYWORDS + [name_ru.lower(), name_en.lower()],
        }
        products.append(product)

    with open(OUT, "w") as fh:
        json.dump(products, fh, ensure_ascii=False, indent=2)

    total_variants = sum(len(p["variants"]) for p in products)
    print(f"Wrote {len(products)} families / {total_variants} variants -> {OUT}")
    for p in products:
        attrs = ", ".join(a["key"] for a in p["variantAttributes"])
        print(f"  {p['id']} {p['slug']:<34} {len(p['variants']):>3} variants | {attrs}")
    if problems:
        print("\n!!! COLLISIONS (same attribute tuple -> multiple SKUs):", file=sys.stderr)
        for fam, coll in problems:
            print(f"  {fam}:", file=sys.stderr)
            for t, cats in coll.items():
                print(f"    {t} -> {cats}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
