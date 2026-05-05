// Parse RCETH product table into structured records.
// Input:  /tmp/rceth/cat1.txt … cat7.txt (single huge line each)
// Output: /tmp/rceth/parsed.json (array of structured products)

import { readFileSync, writeFileSync } from "node:fs";

const CATEGORIES = [
  { num: 1, group: "venous", title: "Пробирки вакуумные для забора крови" },
  { num: 2, group: "urine", title: "Пробирки вакуумные для забора мочи" },
  { num: 3, group: "capillary", title: "Пробирки MiniCollect® для микропроб" },
  { num: 4, group: "rack", title: "Штативы для пробирок" },
  { num: 5, group: "blood-device", title: "Устройства для забора крови из вены" },
  { num: 6, group: "holder", title: "Держатели" },
  { num: 7, group: "urine-device", title: "Устройства для забора мочи" },
];

// Anchors for splitting the long composition string into individual product names.
const ANCHORS = [
  "VACUETTE®",
  "MiniCollect®",
  "MULTIFLY®",
  "MULTI-ADAPTER®",
  "HOLDEX®",
  "MEDIPLUS®",
  "VACUETTE",
  "Standard Tube Holder",
  "Speedy Quick Release",
  "Plastic Cannula",
  "Sample Collection Adapter",
  "ESR Rack",
  "Urine Beaker",
  "Urine Transfer",
  "Urine Tube",
  "Reagent Tube",
  "Coag Aspiration",
  "Urine Sampler",
];

// Split a long composition string into individual product names.
function splitProducts(text) {
  // Pre-clean
  const cleaned = text.replace(/\s+/g, " ").trim();
  // Build a regex that splits at any anchor while keeping the anchor at the start of each piece.
  const escaped = ANCHORS.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(?=(?:${escaped.join("|")}))`, "g");
  const pieces = cleaned.split(re).map((p) => p.trim()).filter(Boolean);
  return pieces;
}

// Heuristic feature extractors for VACUETTE® and MiniCollect® tube names.
const ADDITIVES = [
  // [token regex, additive code, label]
  { re: /\b4NC ESR sodium citrate (?:3,2|3\.2)%/i, code: "esr-citrate-32", label: "4NC ESR Citrate 3.2%" },
  { re: /\b9NC Coagulation sodium citrate (?:3,2|3\.2)%(?:,?\s*CTAD)?/i, code: (m) => /CTAD/i.test(m) ? "ctad" : "citrate-32", label: (m) => /CTAD/i.test(m) ? "CTAD" : "Sodium Citrate 3.2%" },
  { re: /\b9NC Coagulation sodium citrate (?:3,8|3\.8)%/i, code: "citrate-38", label: "Sodium Citrate 3.8%" },
  { re: /\bACD-?A\b/i, code: "acd-a", label: "ACD-A" },
  { re: /\bACD-?B\b/i, code: "acd-b", label: "ACD-B" },
  { re: /\bCPDA-?1\b/i, code: "cpda-1", label: "CPDA-1" },
  { re: /\bCAT Crossmatch Serum/i, code: "crossmatch-serum", label: "Crossmatch Serum CAT" },
  { re: /\bK3E Crossmatch K3EDTA/i, code: "crossmatch-k3edta", label: "Crossmatch K3EDTA" },
  { re: /\b(?:Z|CAT) Serum Fast Separator/i, code: "serum-cat-fast", label: "FAST Serum CAT + Gel" },
  { re: /\b(?:Z|CAT) Serum (?:Sep(?:arator)? )?Clot Activator(?:,?\s*FAST)?/i, code: (m) => /FAST/i.test(m) ? "serum-cat-fast" : (/Sep/i.test(m) ? "serum-cat-gel" : "serum-cat"), label: (m) => /FAST/i.test(m) ? "FAST Serum CAT" : (/Sep/i.test(m) ? "Serum CAT + Gel" : "Serum CAT") },
  { re: /\b(?:Z|CAT) Serum Sep(?:arator)?\b/i, code: "serum-sep", label: "Serum Separator (no CAT)" },
  { re: /\bFE Glucose Test only/i, code: "fluoride-edta-test", label: "FE Glucose Test only" },
  { re: /\bLithium Heparin\s*\/\s*Iodacetate/i, code: "li-heparin-iodacetate", label: "Li-Heparin / Iodacetate" },
  { re: /\bCPDA(?:-1)?\b/i, code: "cpda", label: "CPDA-1" },
  { re: /\bCTAD\b/i, code: "ctad", label: "CTAD" },
  { re: /\bEDTA\s+Aprotinin\b/i, code: "edta-aprotinin", label: "EDTA + Aprotinin" },
  { re: /\bHomocysteine\b/i, code: "homocysteine", label: "Homocysteine Detection" },
  { re: /\bZ No Additive/i, code: "no-additive", label: "Z No Additive" },
  { re: /\bZ Discard Tube/i, code: "discard", label: "Z Discard" },
  { re: /\bLH Lithium Heparin Separator/i, code: "li-heparin-gel", label: "Li-Heparin + Gel" },
  { re: /\bLH Lithium Heparin\b/i, code: "li-heparin", label: "Li-Heparin" },
  { re: /\bNH Sodium Heparin\b/i, code: "na-heparin", label: "Na-Heparin" },
  { re: /\bK2E K2EDTA Separator/i, code: "k2edta-gel", label: "K2EDTA + Gel" },
  { re: /\bK2E K2EDTA\b/i, code: "k2edta", label: "K2EDTA" },
  { re: /\bK3E K3EDTA Separator/i, code: "k3edta-gel", label: "K3EDTA + Gel" },
  { re: /\bK3E K3EDTA\b/i, code: "k3edta", label: "K3EDTA" },
  { re: /\bFX Sodium Fluoride\s*\/\s*Potassium Oxalate/i, code: "fluoride-oxalate", label: "FX NaF / K-oxalate" },
  { re: /\bFE Sodium Fluoride\s*\/\s*K3EDTA/i, code: "fluoride-edta", label: "FE NaF / K3EDTA" },
  { re: /\bFC Mix\b/i, code: "fc-mix", label: "FC Mix (Citrate Buffer)" },
  { re: /\bGlucomedics\b/i, code: "glucomedics", label: "Glucomedics" },
  { re: /\bTrace Element/i, code: "trace-elements", label: "Trace Elements" },
  { re: /\bZNF\b/i, code: "trace-elements-znf", label: "ZNF Trace Elements" },
  { re: /\bRRL Cell Save/i, code: "rrl-cell-save", label: "RRL Cell Save" },
  { re: /\bH8N4 Direct Hb\b/i, code: "direct-hb", label: "Direct Haemoglobin" },
  { re: /\bSED-?Rate\b/i, code: "sed-rate", label: "SED-Rate" },
  { re: /\bUrine\b/i, code: "urine", label: "Urine" },
  { re: /\bStreckGENRFL\b/i, code: "streck-genrfl", label: "Streck GenRFL" },
];

const CAP_TOKENS = [
  "yellow", "red", "green", "blue", "lavender", "violet", "grey", "orange", "white", "black", "gold", "pink", "light-green", "light green", "turquoise", "royal blue", "royal-blue",
];

function detectAdditive(name) {
  for (const a of ADDITIVES) {
    const m = name.match(a.re);
    if (m) {
      const code = typeof a.code === "function" ? a.code(m[0]) : a.code;
      const label = typeof a.label === "function" ? a.label(m[0]) : a.label;
      return { code, label };
    }
  }
  return null;
}

function detectVolume(name) {
  // Match patterns like "2 ml", "0.5 ml", "0,5 ml", "1.5 ml", "0.25 / 0.5 ml"
  const m = name.match(/(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)\s*ml\b/i);
  if (m) return m[1].replace(/,/g, ".").replace(/\s/g, "");
  return null;
}

function detectSize(name) {
  // Patterns: 13x75, 16x100, 9x120, 13x 100 (with stray space)
  const m = name.match(/\b(\d{1,3})\s*[x×]\s*(\d{1,3})\b/i);
  if (m) return `${m[1]}×${m[2]}`;
  return null;
}

function detectCap(name) {
  // "lavender cap" or "lavender cap-white ring"
  const m = name.match(/\b(yellow|red|green|blue|lavender|violet|grey|gray|orange|white|black|gold|pink|light[-\s]green|turquoise|royal[-\s]blue|sand)\s+cap\b/i);
  if (!m) return null;
  return m[1].toLowerCase().replace(/\s/g, "-");
}

function detectRing(name) {
  const m = name.match(/cap\s*-\s*(yellow|red|green|blue|lavender|violet|grey|gray|orange|white|black|gold|pink|light[-\s]green|turquoise|royal[-\s]blue|sand)\s+ring/i);
  if (!m) return null;
  return m[1].toLowerCase().replace(/\s/g, "-");
}

function detectClosure(name) {
  // PREMIUM, non-ridged, sandwich tube, …
  if (/\bPREMIUM\b/i.test(name)) return "PREMIUM";
  if (/\bnon-ridged\b/i.test(name)) return "non-ridged";
  if (/\bsandwich tube\b/i.test(name)) return "sandwich";
  if (/\bsterilized\b/i.test(name)) return "sterile";
  return null;
}

function detectMaterial(name) {
  if (/\bPET\b/.test(name)) return "PET";
  if (/\bPP\b/.test(name)) return "PP";
  if (/\bglass\b/i.test(name)) return "glass";
  return null;
}

function detectFlags(name) {
  const flags = [];
  if (/\bG-barcode label\b/i.test(name)) flags.push("g-barcode");
  if (/\btransparent label\b/i.test(name)) flags.push("transparent-label");
  if (/\bpaper label\b/i.test(name)) flags.push("paper-label");
  if (/\bpolyester label\b/i.test(name)) flags.push("polyester-label");
  if (/\bsterile\b/i.test(name) && !/\bsterilized\b/i.test(name)) flags.push("sterile");
  if (/\bRound Base\b/i.test(name)) flags.push("round-base");
  if (/\bConical Base\b/i.test(name)) flags.push("conical-base");
  if (/\bsingle-packed\b/i.test(name)) flags.push("single-packed");
  if (/\bpre-assembled\b/i.test(name)) flags.push("pre-assembled");
  if (/\bHigh Altitude\b/i.test(name)) flags.push("high-altitude");
  if (/\bDouble-Wall\b/i.test(name)) flags.push("double-wall");
  return flags;
}

function classify(name, group) {
  // Determine "product type" used as the top-level configurator card.
  if (/^MiniCollect®/.test(name)) {
    if (/Complete/i.test(name)) return "minicollect-complete";
    return "minicollect-tube";
  }
  if (/^VACUETTE® TUBE/i.test(name) || /^VACUETTE® FC Mix TUBE/i.test(name)) {
    if (group === "urine") return "urine-tube";
    return "venous-tube";
  }
  if (/^VACUETTE® QUICKSHIELD Complete/i.test(name)) return "quickshield-complete";
  if (/^VACUETTE® QUICKSHIELD/i.test(name)) return "quickshield-holder";
  if (/^VACUETTE® SAFELINK/i.test(name)) return "safelink";
  if (/^VACUETTE® VISIO PLUS/i.test(name)) return "visio-plus-needle";
  if (/^VACUETTE® Blood Transfer/i.test(name)) return "blood-transfer";
  if (/^VACUETTE® Blood Culture/i.test(name)) return "blood-culture-holder";
  if (/^VACUETTE® Premium Multi-Sample/i.test(name) || /^VACUETTE® Premium Single-Use/i.test(name)) return "premium-needle";
  if (/^MULTIFLY®/i.test(name)) return "multifly";
  if (/^MULTI-ADAPTER®/i.test(name)) return "multi-adapter";
  if (/^MEDIPLUS®/i.test(name)) return "mediplus";
  if (/^HOLDEX®/i.test(name)) return "holdex";
  if (/^Standard Tube Holder/i.test(name)) return "standard-holder";
  if (/^Speedy Quick Release/i.test(name)) return "speedy-holder";
  if (/^Plastic Cannula/i.test(name)) return "plastic-cannula";
  if (/^Sample Collection Adapter/i.test(name)) return "sample-adapter";
  if (/^ESR Rack/i.test(name)) return "esr-rack";
  if (/^Urine Beaker/i.test(name)) return "urine-beaker";
  if (/^Urine Transfer/i.test(name)) return "urine-transfer";
  if (/^Urine Tube/i.test(name)) return "urine-screw-tube";
  if (/^Urine Sampler/i.test(name)) return "urine-sampler";
  if (/^Reagent Tube/i.test(name)) return "reagent-tube";
  if (/^Coag Aspiration/i.test(name)) return "coag-aspiration";
  return "other";
}

function parse(name, group) {
  const additive = detectAdditive(name);
  return {
    rawName: name,
    group,
    type: classify(name, group),
    additive: additive?.code ?? null,
    additiveLabel: additive?.label ?? null,
    volume: detectVolume(name),
    size: detectSize(name),
    capColor: detectCap(name),
    ringColor: detectRing(name),
    closure: detectClosure(name),
    material: detectMaterial(name),
    flags: detectFlags(name),
  };
}

const all = [];
for (const cat of CATEGORIES) {
  const text = readFileSync(`/tmp/rceth/cat${cat.num}.txt`, "utf8");
  const products = splitProducts(text);
  for (const name of products) {
    if (name.length < 4) continue;
    all.push(parse(name, cat.group));
  }
}

writeFileSync("/tmp/rceth/parsed.json", JSON.stringify(all, null, 2));

// Stats
const byType = {};
const byGroup = {};
for (const p of all) {
  byType[p.type] = (byType[p.type] ?? 0) + 1;
  byGroup[p.group] = (byGroup[p.group] ?? 0) + 1;
}
console.log("Total products:", all.length);
console.log("By group:", byGroup);
console.log("By type:", byType);
