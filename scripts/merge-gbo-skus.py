#!/usr/bin/env python3
"""Merge SKUs from data/source/GBO.xls (Greiner Bio-One MZ RB registry export)
into data/products/vacuum-systems.json.

Reads:
  - /Users/gmaxby/Documents/ScreenShots/GBO.xls    (79 unique SKUs)
  - data/products/vacuum-systems.json              (existing catalog)

Writes:
  - data/products/vacuum-systems.json              (updated, with all GBO SKUs)

Strategy:
  1. Parse every GBO Excel row into structured attributes
     (additive, volume, size, closure, capColor, ringColor, material, label, flags)
     using the same heuristics as scripts/parse-rceth.mjs.
  2. For each existing family, fill in catalogNumber on variants whose sourceName
     matches a GBO record (exact-name or attribute-tuple match).
  3. For GBO records that don't match any existing variant, append a new variant.
  4. For GBO SKUs that don't fit any existing family (needles, blood-collection
     sets, luer adapters, beakers, VeinViewer), create new dedicated families.

Run:
    python3 scripts/merge-gbo-skus.py
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

import xlrd

ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = "/Users/gmaxby/Documents/ScreenShots/GBO.xls"
JSON_PATH = ROOT / "data/products/vacuum-systems.json"

# ----------------------------------------------------------------------------
# 1. Parse Excel
# ----------------------------------------------------------------------------

def read_gbo_excel() -> list[dict]:
    wb = xlrd.open_workbook(EXCEL_PATH)
    sheet = wb.sheet_by_index(0)
    unique = {}
    for r in range(4, sheet.nrows):
        row = sheet.row_values(r)
        if len(row) < 4:
            continue
        name = (row[1] or "").strip()
        sku_raw = row[2]
        full = (row[3] or "").strip()
        if not name:
            continue
        if isinstance(sku_raw, float):
            sku = str(int(sku_raw))
        else:
            sku = str(sku_raw).strip()
        if not sku:
            continue
        if sku in unique:
            continue
        unique[sku] = {"sku": sku, "name": name, "full": full}
    return sorted(unique.values(), key=lambda x: x["sku"])


# ----------------------------------------------------------------------------
# 2. Parsing helpers (mirrors scripts/parse-rceth.mjs)
# ----------------------------------------------------------------------------

# Order matters: more specific patterns first.
ADDITIVE_RULES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\b4NC\s+ESR\s+sodium\s+citrate\s+(?:3,2|3\.2)%", re.I), "esr-citrate-32"),
    (re.compile(r"\b9NC\s+Coagulation\s+sodium\s+citrate\s+(?:3,2|3\.2)%[^,]*,\s*CTAD", re.I), "ctad"),
    (re.compile(r"\b9NC\s+Coagulation\s+sodium\s+citrate\s+(?:3,2|3\.2)%", re.I), "citrate-32"),
    (re.compile(r"\b9NC\s+Coagulation\s+sodium\s+citrate\s+(?:3,8|3\.8)%", re.I), "citrate-38"),
    (re.compile(r"\bACD-?A\b", re.I), "acd-a"),
    (re.compile(r"\bACD-?B\b", re.I), "acd-b"),
    (re.compile(r"\bCPDA\b", re.I), "cpda"),
    (re.compile(r"\bCAT\s+Crossmatch\s+Serum", re.I), "crossmatch-serum"),
    (re.compile(r"\bK3E\s+Crossmatch\s+K3EDTA", re.I), "crossmatch-k3edta"),
    (re.compile(r"\bCAT\s+Serum\s+Fast\s+Separator", re.I), "serum-cat-fast"),
    (re.compile(r"\b(?:Z|CAT)\s+Serum\s+Sep(?:arator)?\s+Clot\s+Activator", re.I), "serum-cat-gel"),
    (re.compile(r"\b(?:Z|CAT)\s+Serum\s+Clot\s+Activator", re.I), "serum-cat"),
    (re.compile(r"\bFE\s+Glucose\s+Test\s+only", re.I), "fluoride-edta-test"),
    (re.compile(r"\bLithium\s+Heparin\s*/\s*Iodacetate", re.I), "li-heparin-iodacetate"),
    (re.compile(r"\bCTAD\b", re.I), "ctad"),
    (re.compile(r"\bEDTA\s+Aprotinin", re.I), "edta-aprotinin"),
    (re.compile(r"\bHomocysteine\b", re.I), "homocysteine"),
    (re.compile(r"\bZ\s+No\s+Additive", re.I), "no-additive"),
    (re.compile(r"\bZ\s+Discard\s+Tube", re.I), "discard"),
    (re.compile(r"\bLH\s+Lithium\s+Heparin\s+Separator", re.I), "li-heparin-gel"),
    (re.compile(r"\bLH\s+Lithium\s+Heparin", re.I), "li-heparin"),
    (re.compile(r"\bNH\s+Sodium\s+Heparin", re.I), "na-heparin"),
    (re.compile(r"\bK2E\s+K2EDTA\s+Separator", re.I), "k2edta-gel"),
    (re.compile(r"\bK2E\s+K2EDTA", re.I), "k2edta"),
    (re.compile(r"\bK3E\s+K3EDTA\s+Separator", re.I), "k3edta-gel"),
    (re.compile(r"\bK3E\s+K3EDTA", re.I), "k3edta"),
    (re.compile(r"\bFX\s+Sodium\s+Fluoride\s*/\s*Potassium\s+Oxalate", re.I), "fluoride-oxalate"),
    (re.compile(r"\bFE\s+Sodium\s+Fluoride\s*/\s*K3EDTA", re.I), "fluoride-edta"),
    (re.compile(r"\bFC\s+Mix\b", re.I), "fc-mix"),
    (re.compile(r"\bTrace\s+Element", re.I), "trace-elements"),
    (re.compile(r"\bZ\s+Serum\s+Clot\s+Activator", re.I), "serum-cat"),  # MiniCollect Z-tube treated as serum-cat
    (re.compile(r"\bUrine\s+(?:Stabilur|CCM|No\s+Additive)", re.I), "urine"),  # Urine fallback for tubes
]


def detect_additive(name: str) -> Optional[str]:
    for pat, code in ADDITIVE_RULES:
        if pat.search(name):
            return code
    return None


def detect_volume(name: str) -> Optional[str]:
    # "0.25 / 0.5 ml" or "0,5 ml" or "1.5 ml" or "9 ml"
    m = re.search(r"(\d+(?:[.,]\d+)?(?:\s*/\s*\d+(?:[.,]\d+)?)?)\s*ml\b", name, re.I)
    if m:
        return m.group(1).replace(",", ".").replace(" ", "")
    return None


def detect_size(name: str) -> Optional[str]:
    m = re.search(r"\b(\d{1,3})\s*[x×]\s*(\d{1,3})\b", name)
    if m:
        return f"{m.group(1)}×{m.group(2)}"
    return None


CAP_RE = re.compile(
    r"\b(yellow|red|green|blue|lavender|violet|grey|gray|orange|white|black|gold|pink|light[-\s]green|mint[-\s]green|turquoise|royal[-\s]blue|sand)\s+cap\b",
    re.I,
)
RING_RE = re.compile(
    r"cap\s*-\s*(yellow|red|green|blue|lavender|violet|grey|gray|orange|white|black|gold|pink|light[-\s]green|mint[-\s]green|turquoise|royal[-\s]blue|sand)\s+ring",
    re.I,
)


def detect_cap(name: str) -> Optional[str]:
    m = CAP_RE.search(name)
    if not m:
        return None
    return re.sub(r"\s+", "-", m.group(1).lower())


def detect_ring(name: str) -> Optional[str]:
    m = RING_RE.search(name)
    if not m:
        return None
    return re.sub(r"\s+", "-", m.group(1).lower())


def detect_closure(name: str) -> Optional[str]:
    if re.search(r"\bPREMIUM\b", name):
        return "PREMIUM"
    if re.search(r"\bnon-ridged\b", name, re.I):
        return "non-ridged"
    if re.search(r"\bsandwich\s+tube\b", name, re.I):
        return "sandwich"
    return None


def detect_material(name: str) -> Optional[str]:
    if re.search(r"\bPET\b", name):
        return "PET"
    if re.search(r"\bPP\b", name):
        return "PP"
    if re.search(r"\bglass\b", name, re.I):
        return "glass"
    return None


def detect_flags(name: str) -> list[str]:
    flags = []
    if re.search(r"\bG-?bi-?barcode\b", name, re.I):
        flags.append("g-bi-barcode")
    elif re.search(r"\b(?:G-?barcode|barcode)\s+lab[ea]l\b", name, re.I):
        flags.append("g-barcode")
    if re.search(r"\btransparent\s+lab[ea]l\b", name, re.I):
        flags.append("transparent-label")
    if re.search(r"\bspecial\s+lab[ea]l\b", name, re.I):
        flags.append("special-label")
    if re.search(r"\bRound\s+Base\b", name, re.I):
        flags.append("round-base")
    if re.search(r"\bConical\s+Base\b", name, re.I):
        flags.append("conical-base")
    if re.search(r"\bsingle-?packed\b", name, re.I):
        flags.append("single-packed")
    if re.search(r"\bsterile\b", name, re.I):
        flags.append("sterile")
    if re.search(r"\bpre-assembled\b", name, re.I):
        flags.append("pre-assembled")
    if re.search(r"\bHigh\s+Altitude\b", name, re.I):
        flags.append("high-altitude")
    return flags


def detect_label(flags: list[str]) -> str:
    if "g-bi-barcode" in flags:
        return "G-Bi-Barcode"
    if "g-barcode" in flags:
        return "G-barcode"
    if "transparent-label" in flags:
        return "transparent"
    if "special-label" in flags:
        return "special"
    return "standard"


def classify_type(name: str, sku: str) -> str:
    # Match anywhere in the string (the Excel "full" column has a Russian
    # prefix like "Изделия для забора биологического материала: ...").
    if re.search(r"\bMiniCollect®", name):
        if re.search(r"Complete\b", name, re.I) or re.search(r"pre-assembled", name, re.I):
            return "minicollect-complete"
        return "minicollect-tube"
    if re.search(r"VACUETTE®\s+TUBE\b", name, re.I):
        if re.search(r"\bUrine\b", name, re.I):
            return "urine-tube"
        return "venous-tube"
    # Accessory / device classifications — SPECIFIC PATTERNS FIRST to avoid
    # false positives (e.g. "SAFETY ... Luer Adapter" must not match the
    # standalone "Luer Adapter" rule).
    if re.search(r"SAFETY\s+Blood\s+Collection\s+Set\s*\+\s*Luer", name, re.I):
        return "safety-bcs-luer"
    if re.search(r"SAFETY\s+Blood\s+Collection\s+Set\s*\+\s*Holder", name, re.I):
        return "safety-bcs-holder"
    if re.search(r"Blood\s+Collection\s+Set\s*\+\s*Holder", name, re.I):
        return "bcs-holder"
    if re.search(r"QUICKSHIELD\s+Complete", name, re.I):
        return "quickshield-complete"
    if re.search(r"QUICKSHIELD\s+Safety\s+Tube\s+Holder", name, re.I):
        return "quickshield-holder"
    if re.search(r"SAFELINK\s+Holder", name, re.I):
        return "safelink"
    if re.search(r"VISIO\s+PLUS\s+Needles", name, re.I):
        return "visio-plus-needle"
    if re.search(r"Multiple\s+Use\s+Drawing\s+Needles", name, re.I):
        return "multi-use-needle"
    if re.search(r"Luer\s+Adapter", name, re.I):
        return "luer-adapter"
    if re.search(r"Standard\s+Tube\s+Holder", name, re.I):
        return "standard-holder"
    if re.search(r"ESR\s+Rack", name, re.I):
        return "esr-rack"
    if re.search(r"Urine\s+Beaker", name, re.I):
        return "urine-beaker"
    if re.search(r"Urine\s+Transfer\s+Device", name, re.I):
        return "urine-transfer"
    if re.search(r"VeinViewer|Визуализатор\s+вен", name, re.I):
        return "veinviewer"
    return "other"


def parse_record(record: dict) -> dict:
    name = record["name"]
    full = record.get("full") or name
    # The "full" column often has the cleaner description.
    parse_src = full if len(full) > len(name) else name
    ptype = classify_type(parse_src, record["sku"])
    info = {
        "sku": record["sku"],
        "name": name,
        "full": full,
        "type": ptype,
        "additive": detect_additive(parse_src),
        "volume": detect_volume(parse_src),
        "size": detect_size(parse_src),
        "capColor": detect_cap(parse_src),
        "ringColor": detect_ring(parse_src),
        "closure": detect_closure(parse_src),
        "material": detect_material(parse_src),
        "flags": detect_flags(parse_src),
    }
    info["label"] = detect_label(info["flags"])
    return info


# ----------------------------------------------------------------------------
# 3. Family matching
# ----------------------------------------------------------------------------

# additive code -> existing family id in vacuum-systems.json
ADDITIVE_TO_VENOUS_FAMILY = {
    "esr-citrate-32": "vac-001",
    "citrate-32": "vac-002",
    "citrate-38": "vac-003",
    "ctad": "vac-004",
    "serum-cat": "vac-005",
    "serum-cat-gel": "vac-006",
    "serum-cat-fast": "vac-007",
    "serum-sep": "vac-008",
    "crossmatch-serum": "vac-009",
    "li-heparin": "vac-010",
    "li-heparin-gel": "vac-011",
    "na-heparin": "vac-012",
    "li-heparin-iodacetate": "vac-013",
    "k2edta": "vac-014",
    "k3edta": "vac-015",
    "k2edta-gel": "vac-016",
    "edta-aprotinin": "vac-017",
    "crossmatch-k3edta": "vac-018",
    "fluoride-oxalate": "vac-019",
    "fluoride-edta": "vac-020",
    "fluoride-edta-test": "vac-021",
    "fc-mix": "vac-022",
    "trace-elements": "vac-023",
    "no-additive": "vac-024",
    "discard": "vac-025",
    "homocysteine": "vac-026",
    "acd-a": "vac-027",
    "acd-b": "vac-028",
    "cpda": "vac-029",
}

URINE_FAMILY = "vac-u-030"

ADDITIVE_TO_MINI_FAMILY = {
    "k2edta": "mc-031",
    "k3edta": "mc-032",
    "serum-cat-gel": "mc-033",
    "serum-cat": "mc-034",
    "li-heparin-gel": "mc-035",
    "li-heparin": "mc-036",
    "citrate-32": "mc-037",
    "fluoride-oxalate": "mc-038",
}

ADDITIVE_TO_MINI_COMPLETE_FAMILY = {
    "k2edta": "mcc-039",
    "k3edta": "mcc-040",
    "serum-cat-gel": "mcc-041",
    "serum-cat": "mcc-042",
    "li-heparin-gel": "mcc-043",
    "li-heparin": "mcc-044",
    "fluoride-oxalate": "mcc-045",
}

# Type -> existing accessory family id
TYPE_TO_FAMILY = {
    "esr-rack": "vac-acc-046",
    "standard-holder": "vac-acc-047",
    "quickshield-holder": "vac-acc-049",
    "quickshield-complete": "vac-acc-050",
    "safelink": "vac-acc-051",
    "urine-beaker": "vac-acc-057",
    "urine-transfer": "vac-acc-058",
}


def family_id_for(record: dict) -> Optional[str]:
    t = record["type"]
    a = record["additive"]
    if t == "venous-tube" and a in ADDITIVE_TO_VENOUS_FAMILY:
        return ADDITIVE_TO_VENOUS_FAMILY[a]
    if t == "urine-tube":
        return URINE_FAMILY
    if t == "minicollect-tube" and a in ADDITIVE_TO_MINI_FAMILY:
        return ADDITIVE_TO_MINI_FAMILY[a]
    if t == "minicollect-complete" and a in ADDITIVE_TO_MINI_COMPLETE_FAMILY:
        return ADDITIVE_TO_MINI_COMPLETE_FAMILY[a]
    if t in TYPE_TO_FAMILY:
        return TYPE_TO_FAMILY[t]
    return None


# ----------------------------------------------------------------------------
# 4. Variant matching within a family
# ----------------------------------------------------------------------------

def variant_score(variant: dict, record: dict) -> int:
    """Score how well an existing variant matches a parsed Excel record.
    Higher is better. Negative if a hard attribute conflicts."""
    score = 0
    for key in ("volume", "size", "closure", "capColor", "ringColor", "material"):
        rec_val = record.get(key)
        var_val = variant.get(key)
        if rec_val and var_val:
            if rec_val == var_val:
                score += 5
            else:
                return -1000  # hard conflict
        elif rec_val and not var_val:
            score -= 1  # variant is less specific, partial match
        elif var_val and not rec_val:
            score -= 1
    # Label
    rec_label = record.get("label", "standard")
    var_label = variant.get("label", "standard")
    if rec_label == var_label:
        score += 2
    else:
        return -1000  # hard conflict on label

    # Bonus: same flag set
    rec_flags = set(record.get("flags") or [])
    var_flags = set(variant.get("flags") or [])
    # Flags like "round-base" / "conical-base" are hard differentiators for urine
    for hard in ("round-base", "conical-base", "high-altitude", "g-barcode", "transparent-label", "special-label"):
        if (hard in rec_flags) != (hard in var_flags):
            return -1000
    return score


def best_variant_match(family: dict, record: dict) -> Optional[int]:
    best_idx = None
    best_score = -1
    for i, v in enumerate(family["variants"]):
        s = variant_score(v, record)
        if s > best_score:
            best_score = s
            best_idx = i
    if best_score >= 0:
        return best_idx
    return None


def make_variant_from_record(record: dict, family: dict) -> dict:
    """Build a new variant dict that mirrors the family's existing variant shape."""
    base = family["variants"][0] if family["variants"] else {}
    v = {"catalogNumber": record["sku"], "sourceName": record["name"]}
    # Carry over the same attribute keys as siblings, plus parsed data.
    for key in ("closure", "volume", "size", "capColor", "ringColor", "material", "label", "flags"):
        val = record.get(key)
        if val is not None:
            v[key] = val
        elif key in base and key not in v:
            v[key] = None
    # Keep null shape for siblings
    for key in base.keys():
        if key not in v:
            v[key] = base[key] if key in ("flags",) else None
    # Ensure flags is a list
    if not isinstance(v.get("flags"), list):
        v["flags"] = record.get("flags", [])

    # If the family uses non-standard attribute keys (e.g. "config", "item",
    # "capacity"), supply sensible values so the configurator UI can group
    # this new variant cleanly.
    attr_keys = [a["key"] for a in family.get("variantAttributes", [])]
    for key in attr_keys:
        if key in v and v[key]:
            continue
        if key == "config":
            v["config"] = record.get("full") or record["name"]
        elif key == "item":
            v["item"] = record["name"]
        elif key == "capacity":
            v["capacity"] = record["name"]
    return v


# ----------------------------------------------------------------------------
# 5. Merge logic
# ----------------------------------------------------------------------------

def merge(records: list[dict], catalog: list[dict]) -> tuple[list[dict], dict]:
    id_to_family = {f["id"]: f for f in catalog}
    stats = {"filled": 0, "appended": 0, "unmatched": []}

    for record in records:
        fam_id = family_id_for(record)
        if not fam_id:
            stats["unmatched"].append(record)
            continue
        family = id_to_family.get(fam_id)
        if not family:
            stats["unmatched"].append(record)
            continue
        # First check: does a variant already exist with this catalog number?
        for v in family["variants"]:
            if (v.get("catalogNumber") or "").strip() == record["sku"]:
                break
        else:
            # Try to match by attributes
            idx = best_variant_match(family, record)
            if idx is not None and not (family["variants"][idx].get("catalogNumber") or "").strip():
                # Fill in the SKU on the matching empty variant
                family["variants"][idx]["catalogNumber"] = record["sku"]
                # Also set sourceName to canonical Excel name if missing
                if not family["variants"][idx].get("sourceName"):
                    family["variants"][idx]["sourceName"] = record["name"]
                stats["filled"] += 1
            elif idx is not None and (family["variants"][idx].get("catalogNumber") or "").strip() == record["sku"]:
                pass
            else:
                # Append a brand-new variant.
                new_v = make_variant_from_record(record, family)
                family["variants"].append(new_v)
                stats["appended"] += 1

    return catalog, stats


# ----------------------------------------------------------------------------
# 6. New families for items that don't fit anywhere
# ----------------------------------------------------------------------------

ATTR_GAUGE = {"key": "gauge", "label_ru": "Калибр иглы", "label_en": "Gauge", "label_zh": "针规"}
ATTR_LENGTH = {"key": "length", "label_ru": "Длина", "label_en": "Length", "label_zh": "长度"}
ATTR_TUBE_LEN = {"key": "tubeLength", "label_ru": "Длина трубки", "label_en": "Tubing length", "label_zh": "管长"}
ATTR_PACK_REV = {"key": "packRevision", "label_ru": "Ревизия упаковки", "label_en": "Pack revision", "label_zh": "包装版本"}


def build_new_families(records: list[dict]) -> list[dict]:
    """Group leftover records into new families based on type."""
    by_type: dict[str, list[dict]] = {}
    for r in records:
        by_type.setdefault(r["type"], []).append(r)

    families: list[dict] = []
    sort_offset = 200  # placed after existing families

    def needle_variant(r, gauge, length):
        return {
            "catalogNumber": r["sku"],
            "sourceName": r["name"],
            "gauge": gauge,
            "length": length,
            "flags": ["sterile"],
        }

    # ---- VISIO PLUS Needles --------------------------------------------------
    if "visio-plus-needle" in by_type:
        recs = by_type["visio-plus-needle"]
        variants = []
        for r in recs:
            name = r["name"]
            m_g = re.search(r"(\d{2})\s*G", name)
            m_l = re.search(r"x\s*(1(?:\s*1/2)?)\"", name)
            gauge = f"{m_g.group(1)}G" if m_g else None
            length = f"{m_l.group(1)}\"" if m_l else None
            variants.append(needle_variant(r, gauge, length))
        families.append({
            "id": "vac-acc-070",
            "slug": "vacuette-visio-plus-needles",
            "name": "VACUETTE® VISIO PLUS — иглы с прозрачной камерой",
            "shortDescription": "Иглы с прозрачной визуальной камерой для контроля попадания в вену. Без латекса, стерильно.",
            "description": "Иглы VACUETTE® VISIO PLUS оснащены прозрачной камерой за канюлей, которая позволяет визуально подтвердить попадание в вену до подключения пробирки. Производятся без натурального латекса, стерильны. Доступны калибры 21G и 22G, длиной 1\" и 1 1/2\".",
            "categoryId": "vacuum-systems",
            "subcategory": "holder",
            "additive": None,
            "capColor": None,
            "ringColor": None,
            "images": [],
            "variantAttributes": [ATTR_GAUGE, ATTR_LENGTH],
            "variants": variants,
            "specs": [],
            "tags": ["needle", "visio-plus"],
            "featured": False,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "greiner-bio-one",
            "createdAt": "2024-01-01",
            "sort": sort_offset + 1,
            "i18n": {
                "en": {
                    "name": "VACUETTE® VISIO PLUS Needles",
                    "shortDescription": "Multi-sample needles with a clear flashback chamber. Latex-free, sterile.",
                    "description": "VACUETTE® VISIO PLUS Needles feature a transparent chamber behind the cannula that lets the phlebotomist visually confirm successful venipuncture before connecting a tube. Latex-free, sterile. Available in 21G and 22G gauges, 1\" and 1 1/2\" lengths."
                },
                "zh": {
                    "name": "VACUETTE® VISIO PLUS 多用静脉穿刺针",
                    "shortDescription": "带透明回血腔的多用采血针,无乳胶,灭菌。",
                    "description": "VACUETTE® VISIO PLUS 静脉穿刺针的针柄处带有透明回血腔,可在连接采血管前确认穿刺成功。无乳胶、灭菌。提供 21G 与 22G 两种规格,1\" 和 1 1/2\" 两种长度。"
                }
            }
        })

    # ---- Luer Adapter --------------------------------------------------------
    if "luer-adapter" in by_type:
        recs = by_type["luer-adapter"]
        variants = []
        for r in recs:
            m_g = re.search(r"(\d{2})\s*G", r["name"])
            variants.append({
                "catalogNumber": r["sku"],
                "sourceName": r["name"],
                "gauge": f"{m_g.group(1)}G" if m_g else None,
                "flags": ["sterile"],
            })
        families.append({
            "id": "vac-acc-071",
            "slug": "vacuette-luer-adapter",
            "name": "VACUETTE® Luer Adapter",
            "shortDescription": "Люэр-адаптер для совместимости системы VACUETTE® с иглами-бабочками и шприцами.",
            "description": "VACUETTE® Luer Adapter — переходник для подключения вакуумных пробирок VACUETTE® к иглам-бабочкам, шприцам или внутривенным катетерам с люэровским коннектором. Стерилен, без натурального латекса.",
            "categoryId": "vacuum-systems",
            "subcategory": "holder",
            "additive": None,
            "capColor": None,
            "ringColor": None,
            "images": [],
            "variantAttributes": [ATTR_GAUGE] if len(variants) > 1 else [],
            "variants": variants,
            "specs": [],
            "tags": ["luer-adapter"],
            "featured": False,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "greiner-bio-one",
            "createdAt": "2024-01-01",
            "sort": sort_offset + 2,
            "i18n": {
                "en": {"name": "VACUETTE® Luer Adapter", "shortDescription": "Luer adapter that connects VACUETTE® tubes to butterfly sets and luer syringes.", "description": "The VACUETTE® Luer Adapter connects VACUETTE® evacuated tubes to winged blood-collection sets, luer-lock syringes and IV cannulas. Sterile, latex-free."},
                "zh": {"name": "VACUETTE® 鲁尔接头", "shortDescription": "用于将 VACUETTE® 试管连接至蝶翼针组或鲁尔注射器的接头。", "description": "VACUETTE® 鲁尔接头可将 VACUETTE® 真空采血管与翼状采血针组、鲁尔注射器及静脉留置导管相连接。无菌、无乳胶。"}
            }
        })

    # ---- Multiple Use Drawing Needles ---------------------------------------
    if "multi-use-needle" in by_type:
        recs = by_type["multi-use-needle"]
        variants = []
        for r in recs:
            name = r["name"]
            m_g = re.search(r"(\d{2})\s*G", name)
            m_l = re.search(r"x\s*(1(?:\s*1/2)?)\"", name)
            variants.append({
                "catalogNumber": r["sku"],
                "sourceName": r["name"],
                "gauge": f"{m_g.group(1)}G" if m_g else None,
                "length": f"{m_l.group(1)}\"" if m_l else None,
                "flags": ["sterile"],
            })
        families.append({
            "id": "vac-acc-072",
            "slug": "vacuette-multiple-use-drawing-needles",
            "name": "VACUETTE® Multiple Use Drawing Needles",
            "shortDescription": "Многоразовые двусторонние иглы для забора крови.",
            "description": "VACUETTE® Multiple Use Drawing Needles — двусторонние иглы для последовательного забора нескольких пробирок при одной венепункции. Без латекса, стерильны. Доступны 21G и 22G длиной 1 1/2\".",
            "categoryId": "vacuum-systems",
            "subcategory": "holder",
            "additive": None,
            "capColor": None,
            "ringColor": None,
            "images": [],
            "variantAttributes": [ATTR_GAUGE] if len({v.get("gauge") for v in variants}) > 1 else [],
            "variants": variants,
            "specs": [],
            "tags": ["needle"],
            "featured": False,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "greiner-bio-one",
            "createdAt": "2024-01-01",
            "sort": sort_offset + 3,
            "i18n": {
                "en": {"name": "VACUETTE® Multiple Use Drawing Needles", "shortDescription": "Double-ended needles for collecting multiple tubes in one venipuncture.", "description": "VACUETTE® Multiple Use Drawing Needles are double-ended needles that allow several tubes to be drawn from a single venipuncture. Latex-free and sterile. 21G and 22G in 1 1/2\" length."},
                "zh": {"name": "VACUETTE® 多用采血针", "shortDescription": "双头采血针,一次穿刺可采集多管样本。", "description": "VACUETTE® 多用采血针为双头设计,可在一次穿刺中采集多管样本。无乳胶、灭菌。提供 21G 与 22G 两种规格,长度 1 1/2\"。"}
            }
        })

    # ---- SAFETY Blood Collection Set + Luer Adapter -------------------------
    def parse_bcs(r):
        # Use FULL name when available — it's the cleanest source for these
        # nightmare tubing-length formats.
        name = r.get("full") or r["name"]
        m_g = re.search(r"(\d{2})\s*G", name)
        # Tube length appears in many shapes:
        #   "tubing length 7 1/2" (19 cm)"
        #   "Tube length: 7.5""(19cm)"
        #   "tubing length 4 (10 cm)"
        #   "tubing length 4" (10 cm)"
        m_cm = re.search(r"(\d{1,2})\s*cm", name)
        m_in = re.search(r"(?:length[:\s]+)(\d+(?:\.\d+)?(?:\s*1/2)?)\s*\"?\s*\(?\s*\d{1,2}\s*cm", name, re.I)
        tube_in = None
        if m_in:
            tube_in = m_in.group(1).strip()
            # Normalise "7 1/2" → "7 1/2", "7.5" → "7.5"
            tube_in = re.sub(r"\s+", " ", tube_in)
        tube_cm = m_cm.group(1) if m_cm else None
        tube_str = None
        if tube_in and tube_cm:
            tube_str = f'{tube_in}" ({tube_cm} cm)'
        elif tube_cm:
            tube_str = f"{tube_cm} cm"
        return {
            "gauge": f"{m_g.group(1)}G" if m_g else None,
            "tubeLength": tube_str,
            "packRevision": "V1" if r["sku"].endswith("V1") else "original",
        }

    if "safety-bcs-luer" in by_type:
        recs = by_type["safety-bcs-luer"]
        variants = []
        for r in recs:
            attrs = parse_bcs(r)
            variants.append({
                "catalogNumber": r["sku"],
                "sourceName": r["name"],
                **attrs,
                "flags": ["sterile", "single-packed"],
            })
        # Determine which attributes vary
        attr_pool = [ATTR_GAUGE, ATTR_TUBE_LEN, ATTR_PACK_REV]
        var_attrs = [a for a in attr_pool if len({v.get(a["key"]) for v in variants if v.get(a["key"])}) > 1]
        families.append({
            "id": "vac-acc-073",
            "slug": "vacuette-safety-blood-collection-set-luer",
            "name": "VACUETTE® SAFETY Blood Collection Set + Luer Adapter",
            "shortDescription": "Безопасный набор для взятия крови с люэр-адаптером и иглой-бабочкой.",
            "description": "VACUETTE® SAFETY Blood Collection Set с люэр-адаптером объединяет иглу-бабочку с защитой от случайного укола и переходник luer-lock для подключения к вакуумной системе. Стерилен, одноштучная упаковка, без натурального латекса.",
            "categoryId": "vacuum-systems",
            "subcategory": "holder",
            "additive": None,
            "capColor": None,
            "ringColor": None,
            "images": [],
            "variantAttributes": var_attrs,
            "variants": variants,
            "specs": [],
            "tags": ["safety", "blood-collection-set", "luer"],
            "featured": False,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "greiner-bio-one",
            "createdAt": "2024-01-01",
            "sort": sort_offset + 4,
            "i18n": {
                "en": {"name": "VACUETTE® SAFETY Blood Collection Set + Luer Adapter", "shortDescription": "Safety winged blood collection set with luer adapter.", "description": "VACUETTE® SAFETY Blood Collection Set with luer adapter pairs a needlestick-protected butterfly needle with a luer-lock adapter for vacuum tube collection. Sterile, single-packed, latex-free."},
                "zh": {"name": "VACUETTE® 安全采血针组 + 鲁尔接头", "shortDescription": "带防针刺保护与鲁尔接头的蝶翼采血针组。", "description": "VACUETTE® 安全采血针组(含鲁尔接头)将带防针刺保护的蝶翼针与鲁尔锁接头组合,用于真空采血。无菌、单只包装、无乳胶。"}
            }
        })

    if "safety-bcs-holder" in by_type:
        recs = by_type["safety-bcs-holder"]
        variants = []
        for r in recs:
            attrs = parse_bcs(r)
            variants.append({
                "catalogNumber": r["sku"],
                "sourceName": r["name"],
                **attrs,
                "flags": ["sterile", "single-packed"],
            })
        attr_pool = [ATTR_GAUGE, ATTR_TUBE_LEN, ATTR_PACK_REV]
        var_attrs = [a for a in attr_pool if len({v.get(a["key"]) for v in variants if v.get(a["key"])}) > 1]
        families.append({
            "id": "vac-acc-074",
            "slug": "vacuette-safety-blood-collection-set-holder",
            "name": "VACUETTE® SAFETY Blood Collection Set + Holder",
            "shortDescription": "Безопасный набор для взятия крови с держателем и иглой-бабочкой.",
            "description": "VACUETTE® SAFETY Blood Collection Set с держателем — готовая система: игла-бабочка с защитой от укола, гибкая трубка и преднасаженный держатель. Стерильно, одноштучная упаковка, без латекса.",
            "categoryId": "vacuum-systems",
            "subcategory": "holder",
            "additive": None,
            "capColor": None,
            "ringColor": None,
            "images": [],
            "variantAttributes": var_attrs,
            "variants": variants,
            "specs": [],
            "tags": ["safety", "blood-collection-set", "holder"],
            "featured": False,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "greiner-bio-one",
            "createdAt": "2024-01-01",
            "sort": sort_offset + 5,
            "i18n": {
                "en": {"name": "VACUETTE® SAFETY Blood Collection Set + Holder", "shortDescription": "Safety winged blood collection set with pre-attached holder.", "description": "VACUETTE® SAFETY Blood Collection Set with holder is a ready-to-use system: safety butterfly needle, flexible tubing and a pre-attached tube holder. Sterile, single-packed, latex-free."},
                "zh": {"name": "VACUETTE® 安全采血针组 + 支架", "shortDescription": "带防针刺保护和预装支架的蝶翼采血针组。", "description": "VACUETTE® 安全采血针组(含支架)即开即用:防针刺蝶翼针、软管与预装管座。无菌、单只包装、无乳胶。"}
            }
        })

    if "bcs-holder" in by_type:
        recs = by_type["bcs-holder"]
        variants = []
        for r in recs:
            attrs = parse_bcs(r)
            variants.append({
                "catalogNumber": r["sku"],
                "sourceName": r["name"],
                **attrs,
                "flags": ["sterile", "single-packed"],
            })
        attr_pool = [ATTR_GAUGE, ATTR_TUBE_LEN]
        var_attrs = [a for a in attr_pool if len({v.get(a["key"]) for v in variants if v.get(a["key"])}) > 1]
        families.append({
            "id": "vac-acc-075",
            "slug": "vacuette-blood-collection-set-holder",
            "name": "VACUETTE® Blood Collection Set + Holder",
            "shortDescription": "Стандартный набор для взятия крови с держателем и иглой-бабочкой.",
            "description": "VACUETTE® Blood Collection Set с держателем — игла-бабочка без защитного механизма, гибкая трубка и преднасаженный держатель. Стерильно, одноштучная упаковка, без натурального латекса.",
            "categoryId": "vacuum-systems",
            "subcategory": "holder",
            "additive": None,
            "capColor": None,
            "ringColor": None,
            "images": [],
            "variantAttributes": var_attrs,
            "variants": variants,
            "specs": [],
            "tags": ["blood-collection-set", "holder"],
            "featured": False,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "greiner-bio-one",
            "createdAt": "2024-01-01",
            "sort": sort_offset + 6,
            "i18n": {
                "en": {"name": "VACUETTE® Blood Collection Set + Holder", "shortDescription": "Standard winged blood collection set with pre-attached holder.", "description": "VACUETTE® Blood Collection Set with holder: butterfly needle, flexible tubing and a pre-attached holder. Sterile, single-packed, latex-free."},
                "zh": {"name": "VACUETTE® 采血针组 + 支架", "shortDescription": "标准蝶翼采血针组,含预装支架。", "description": "VACUETTE® 采血针组(含支架):蝶翼针、软管与预装管座。无菌、单只包装、无乳胶。"}
            }
        })

    # ---- VeinViewer ---------------------------------------------------------
    if "veinviewer" in by_type:
        recs = by_type["veinviewer"]
        variants = []
        for r in recs:
            variants.append({
                "catalogNumber": r["sku"],
                "sourceName": r["name"],
                "model": "Vision 2",
            })
        families.append({
            "id": "vac-acc-076",
            "slug": "veinviewer-vision-2",
            "name": "Визуализатор вен VeinViewer® Vision 2",
            "shortDescription": "Транс­ил­лю­ми­на­тор вен ин­фра­крас­но­го диа­па­зо­на для пре­ци­зи­он­ной венепункции.",
            "description": "VeinViewer® Vision 2 — инфракрасный визуализатор вен, проецирующий карту подкожных вен прямо на кожу пациента. Существенно повышает успех венепункции у детей, пожилых и пациентов с трудным венозным доступом. Не требует расходных материалов.",
            "categoryId": "vacuum-systems",
            "subcategory": "other",
            "additive": None,
            "capColor": None,
            "ringColor": None,
            "images": [],
            "variantAttributes": [],
            "variants": variants,
            "specs": [],
            "tags": ["veinviewer", "vein-illuminator"],
            "featured": False,
            "inStock": True,
            "catalogNumber": variants[0]["catalogNumber"] if variants else "",
            "manufacturer": "greiner-bio-one",
            "createdAt": "2024-01-01",
            "sort": sort_offset + 7,
            "i18n": {
                "en": {"name": "VeinViewer® Vision 2 Vein Illuminator", "shortDescription": "Near-infrared vein illuminator for precision venipuncture.", "description": "VeinViewer® Vision 2 is a near-infrared vein-imaging device that projects a real-time map of subcutaneous veins onto the patient's skin. Significantly improves venipuncture success in paediatric, geriatric and difficult-access patients. Disposable-free."},
                "zh": {"name": "VeinViewer® Vision 2 静脉显像仪", "shortDescription": "近红外静脉成像仪,辅助精准穿刺。", "description": "VeinViewer® Vision 2 为近红外静脉成像设备,可将皮下静脉的实时图像投射到患者皮肤表面。显著提高儿童、老年及静脉条件差患者的穿刺成功率,无需耗材。"}
            }
        })

    return families


# ----------------------------------------------------------------------------
# 7. Post-process: clean up "config" field truncation bug + ensure all variants
#    in non-attribute families have the catalog number set when possible.
# ----------------------------------------------------------------------------

def cleanup_config_field(catalog: list[dict]) -> None:
    """The original generator stripped the first character of every `config`
    field (e.g. 'tandard' instead of 'Standard'). Restore by copying from
    sourceName when sourceName exists."""
    for fam in catalog:
        for v in fam.get("variants", []):
            if "config" in v and v.get("sourceName"):
                src = v["sourceName"].strip()
                # Original cropping pattern: original generator stripped a known
                # prefix. We instead just store the sourceName itself.
                if isinstance(v["config"], str) and len(v["config"]) > 0 and not src.startswith(v["config"]):
                    v["config"] = src


def ensure_family_catalog_numbers(catalog: list[dict]) -> None:
    """Top-level family.catalogNumber should mirror the first variant with a SKU."""
    for fam in catalog:
        first = next(
            (v for v in fam.get("variants", []) if (v.get("catalogNumber") or "").strip()),
            None,
        )
        if first and not (fam.get("catalogNumber") or "").strip():
            fam["catalogNumber"] = first["catalogNumber"]


def repair_pre_existing_holes(catalog: list[dict]) -> None:
    """Backfill obvious holes in old scraped data that would otherwise leave
    the configurator with un-selectable variants."""
    fam_by_id = {f["id"]: f for f in catalog}

    def fill(fid: str, predicate, key: str, value):
        fam = fam_by_id.get(fid)
        if not fam:
            return
        for v in fam.get("variants", []):
            try:
                if predicate(v) and (v.get(key) in (None, "")):
                    v[key] = value
            except Exception:
                pass

    # vac-001 v#1 — ESR pre-barcoded 13×75 PREMIUM, missing "material"; the
    # standard label is PET like all modern VACUETTE tubes.
    fill("vac-001",
         lambda v: v.get("size") == "13×75" and v.get("label") == "G-barcode",
         "material", "PET")

    # vac-014 — a couple of scraped variants have sourceName "13x75yellow"
    # (no space) so the size regex missed the dimensions. Backfill from the
    # sourceName when the typo is present.
    fill("vac-014",
         lambda v: not v.get("size") and isinstance(v.get("sourceName"), str)
                   and "13x75" in v["sourceName"].lower(),
         "size", "13×75")

    # vac-024 v#19 — Z No Additive 5 ml 13×100 sample variant missing closure.
    fill("vac-024",
         lambda v: v.get("volume") == "5" and v.get("size") == "13×100" and not v.get("closure"),
         "closure", "non-ridged")


# ----------------------------------------------------------------------------
# Entry point
# ----------------------------------------------------------------------------

def main():
    print("Reading", EXCEL_PATH)
    raw = read_gbo_excel()
    print(f"  {len(raw)} unique SKUs")

    parsed = [parse_record(r) for r in raw]

    print("Loading", JSON_PATH)
    catalog = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    initial_variant_count = sum(len(f["variants"]) for f in catalog)

    catalog, stats = merge(parsed, catalog)

    unmatched_records = stats["unmatched"]
    print(f"  filled: {stats['filled']}, appended: {stats['appended']}, unmatched: {len(unmatched_records)}")

    # Build new families for the unmatched records
    new_families = build_new_families(unmatched_records)
    print(f"  new families created: {len(new_families)} ({sum(len(f['variants']) for f in new_families)} variants)")
    catalog.extend(new_families)

    cleanup_config_field(catalog)
    repair_pre_existing_holes(catalog)
    ensure_family_catalog_numbers(catalog)

    final_variant_count = sum(len(f["variants"]) for f in catalog)
    print(f"  variants: {initial_variant_count} -> {final_variant_count}")
    print(f"  families: {len(catalog)}")

    # Final audit: which Excel SKUs ended up in the catalog?
    catalog_skus = set()
    for f in catalog:
        for v in f.get("variants", []):
            cn = (v.get("catalogNumber") or "").strip()
            if cn:
                catalog_skus.add(cn)
    excel_skus = {r["sku"] for r in raw}
    missing = sorted(excel_skus - catalog_skus)
    if missing:
        print(f"  STILL MISSING ({len(missing)}):")
        for sku in missing:
            name = next(r["name"] for r in raw if r["sku"] == sku)
            print(f"    {sku}  {name[:80]}")
    else:
        print("  All 79 GBO Excel SKUs are now in the catalog.")

    JSON_PATH.write_text(
        json.dumps(catalog, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {JSON_PATH}")


if __name__ == "__main__":
    main()
