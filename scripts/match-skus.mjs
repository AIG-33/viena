// Match RCETH product names to GBO SKUs using a STRUCTURED comparison
// (parse both sides via parse-rceth's logic, then compare attribute tuples).

import { readFileSync, writeFileSync } from "node:fs";

const parsedRceth = JSON.parse(
  readFileSync("/tmp/rceth/parsed.json", "utf8")
);
const skuMap = JSON.parse(readFileSync("/tmp/rceth/sku-map.json", "utf8"));

// Re-use the same detector logic (mirrored copy to avoid cross-imports).
const ADDITIVES = [
  { re: /\b4NC ESR sodium citrate (?:3,2|3\.2)%/i, code: "esr-citrate-32" },
  { re: /\bCAT Crossmatch Serum/i, code: "crossmatch-serum" },
  { re: /\bK3E Crossmatch K3EDTA/i, code: "crossmatch-k3edta" },
  { re: /\b(?:Z|CAT) Serum Fast Separator/i, code: "serum-cat-fast" },
  {
    re: /\b(?:Z|CAT) Serum (?:Sep(?:arator)? )?Clot Activator(?:,?\s*FAST)?/i,
    code: (m) =>
      /FAST/i.test(m)
        ? "serum-cat-fast"
        : /Sep/i.test(m)
          ? "serum-cat-gel"
          : "serum-cat",
  },
  { re: /\b(?:Z|CAT) Serum Sep(?:arator)?\b/i, code: "serum-sep" },
  { re: /\bFE Glucose Test only/i, code: "fluoride-edta-test" },
  { re: /\bLithium Heparin\s*\/\s*Iodacetate/i, code: "li-heparin-iodacetate" },
  { re: /\bCPDA(?:-1)?\b/i, code: "cpda" },
  { re: /\bCTAD\b/i, code: "ctad" },
  { re: /\bEDTA\s+Aprotinin\b/i, code: "edta-aprotinin" },
  { re: /\bHomocysteine\b/i, code: "homocysteine" },
  {
    re: /\b9NC Coagulation sodium citrate (?:3,2|3\.2)%(?:,?\s*CTAD)?/i,
    code: (m) => (/CTAD/i.test(m) ? "ctad" : "citrate-32"),
  },
  {
    re: /\b9NC Coagulation sodium citrate (?:3,8|3\.8)%/i,
    code: "citrate-38",
  },
  { re: /\bACD-?A\b/i, code: "acd-a" },
  { re: /\bACD-?B\b/i, code: "acd-b" },
  { re: /\bLH Lithium Heparin Separator/i, code: "li-heparin-gel" },
  { re: /\bLH Lithium Heparin\b/i, code: "li-heparin" },
  { re: /\bNH Sodium Heparin\b/i, code: "na-heparin" },
  { re: /\bK2E K2EDTA Separator/i, code: "k2edta-gel" },
  { re: /\bK2E K2EDTA\b/i, code: "k2edta" },
  { re: /\bK3E K3EDTA Separator/i, code: "k3edta-gel" },
  { re: /\bK3E K3EDTA\b/i, code: "k3edta" },
  { re: /\bFX Sodium Fluoride\s*\/\s*Potassium Oxalate/i, code: "fluoride-oxalate" },
  { re: /\bFE Sodium Fluoride\s*\/\s*K3EDTA/i, code: "fluoride-edta" },
  { re: /\bFC Mix\b/i, code: "fc-mix" },
  { re: /\bGlucomedics\b/i, code: "glucomedics" },
  { re: /\bTrace Element/i, code: "trace-elements" },
  { re: /\bZNF\b/i, code: "trace-elements-znf" },
  { re: /\bZ No Additive/i, code: "no-additive" },
  { re: /\bZ Discard Tube/i, code: "discard" },
  { re: /\bUrine\b/i, code: "urine" },
];

function detectAdditive(name) {
  for (const a of ADDITIVES) {
    const m = name.match(a.re);
    if (m) {
      return typeof a.code === "function" ? a.code(m[0]) : a.code;
    }
  }
  return null;
}
function detectVolume(name) {
  const m = name.match(
    /(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)\s*ml\b/i
  );
  if (m) return m[1].replace(/,/g, ".").replace(/\s/g, "");
  return null;
}
function detectSize(name) {
  const m = name.match(/\b(\d{1,3})\s*[x×]\s*(\d{1,3})\b/i);
  if (m) return `${m[1]}×${m[2]}`;
  return null;
}
function detectCap(name) {
  const m = name.match(
    /\b(yellow|red|green|blue|lavender|violet|grey|gray|orange|white|black|gold|pink|light[-\s]green|mint[-\s]green|turquoise|royal[-\s]blue|sand)\s+cap\b/i
  );
  if (!m) return null;
  return m[1].toLowerCase().replace(/\s/g, "-").replace("mint-", "");
}
function detectRing(name) {
  const m = name.match(
    /cap\s*-\s*(yellow|red|green|blue|lavender|violet|grey|gray|orange|white|black|gold|pink|light[-\s]green|mint[-\s]green|turquoise|royal[-\s]blue|sand)\s+ring/i
  );
  if (!m) return null;
  return m[1].toLowerCase().replace(/\s/g, "-").replace("mint-", "");
}
function detectClosure(name) {
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
function detectLabel(name) {
  if (/\bG-barcode label\b/i.test(name)) return "G-barcode";
  if (/\btransparent label\b/i.test(name)) return "transparent";
  if (/\bpaper label\b/i.test(name)) return "paper";
  if (/\bpolyester label\b/i.test(name)) return "polyester";
  if (/\bspecial label\b/i.test(name)) return "special";
  if (/\bblack label\b/i.test(name)) return "black";
  return "standard";
}

function attrs(name) {
  return {
    additive: detectAdditive(name),
    volume: detectVolume(name),
    size: detectSize(name),
    cap: detectCap(name),
    ring: detectRing(name),
    closure: detectClosure(name),
    material: detectMaterial(name),
    label: detectLabel(name),
  };
}

// ---------------------------------------------------------------------------
// Build SKU index by attribute key (excluding label first to allow loose match).
// ---------------------------------------------------------------------------
const skuIndex = new Map(); // strict key -> sku
const skuLooseIndex = new Map(); // loose key (no label) -> [sku]

for (const [sku, name] of Object.entries(skuMap)) {
  const a = attrs(name);
  const strict = JSON.stringify(a);
  const loose = JSON.stringify({ ...a, label: null });
  skuIndex.set(strict, sku);
  if (!skuLooseIndex.has(loose)) skuLooseIndex.set(loose, []);
  skuLooseIndex.get(loose).push(sku);
}

// ---------------------------------------------------------------------------
// Match each parsed RCETH record.
// ---------------------------------------------------------------------------
let strictHits = 0;
let looseHits = 0;
let unmatched = 0;

for (const p of parsedRceth) {
  const a = attrs(p.rawName);
  const strictKey = JSON.stringify(a);
  if (skuIndex.has(strictKey)) {
    p.catalogNumber = skuIndex.get(strictKey);
    p.skuMatch = "strict";
    strictHits += 1;
    continue;
  }
  const looseKey = JSON.stringify({ ...a, label: null });
  const looseList = skuLooseIndex.get(looseKey);
  if (looseList && looseList.length === 1) {
    p.catalogNumber = looseList[0];
    p.skuMatch = "loose";
    looseHits += 1;
    continue;
  }
  p.catalogNumber = null;
  p.skuMatch = "none";
  unmatched += 1;
}

console.log("Strict matches:", strictHits);
console.log("Loose matches :", looseHits);
console.log("Unmatched     :", unmatched);
console.log("Total products:", parsedRceth.length);

writeFileSync(
  "/tmp/rceth/parsed-skus.json",
  JSON.stringify(parsedRceth, null, 2)
);

// Diagnostic — group unmatched by additive
const unmatchedByAdditive = {};
for (const p of parsedRceth) {
  if (p.skuMatch !== "none") continue;
  const k = p.additive ?? "none";
  unmatchedByAdditive[k] = (unmatchedByAdditive[k] ?? 0) + 1;
}
console.log("\nUnmatched by additive:");
for (const [k, n] of Object.entries(unmatchedByAdditive).sort(
  (a, b) => b[1] - a[1]
)) {
  console.log(`  ${k}: ${n}`);
}
