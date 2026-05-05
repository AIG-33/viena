// Extract SKU↔name pairs from every GBO scrape we have on disk + manual
// additions surfaced via WebSearch.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const TOOLS_DIR =
  "/Users/gmaxby/.cursor/projects/Users-gmaxby-AIG-Viena/agent-tools";

const map = {};

function ingestFile(path) {
  const txt = readFileSync(path, "utf8");
  const lines = txt.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    // Markdown form: **Item:[<sku>](url)**
    const m = lines[i].match(/\*\*Item:\[(\d+P?(?:CA)?)\]/);
    if (m) {
      const sku = m[1];
      // Product name is on the next line.
      const next = lines[i + 1] ?? "";
      if (/VACUETTE®|MiniCollect®/.test(next)) {
        const name = next.trim();
        if (!map[sku] || name.length > (map[sku]?.length ?? 0)) {
          map[sku] = name;
        }
      }
      continue;
    }
  }
}

if (existsSync(TOOLS_DIR)) {
  for (const f of readdirSync(TOOLS_DIR)) {
    if (!f.endsWith(".txt")) continue;
    try {
      ingestFile(join(TOOLS_DIR, f));
    } catch {
      // ignore unreadable files
    }
  }
}

// ---------------------------------------------------------------------------
// Manual additions surfaced from web research (high-confidence SKU↔name pairs).
// ---------------------------------------------------------------------------
const MANUAL = {
  // ESR
  "729073": "VACUETTE® TUBE 1.5 ml 4NC ESR sodium citrate 3.2% 9x120 black cap, PP",
  "729070": "VACUETTE® TUBE 2.75 ml 4NC ESR sodium citrate 3.2% 9x120 black cap, PP",
  "729090": "VACUETTE® TUBE 1.6 ml 4NC ESR sodium citrate 3.2% 9x120 black cap, glass",
  "729093": "VACUETTE® TUBE 2.9 ml 4NC ESR sodium citrate 3.2% 9x120 black cap, glass",

  // Coagulation 9NC 3.2%
  "454321": "VACUETTE® TUBE 2 ml 9NC Coagulation sodium citrate 3.2% 13x75 blue cap-white ring, sandwich tube, PREMIUM",
  "454322": "VACUETTE® TUBE 2 ml 9NC Coagulation sodium citrate 3.2% 13x75 blue cap-white ring, sandwich tube, non-ridged",
  "454323": "VACUETTE® TUBE 2 ml 9NC Coagulation sodium citrate 3.2% 13x75 blue cap-white ring, sandwich tube, non-ridged, High Altitude",
  "454332": "VACUETTE® TUBE 3.5 ml 9NC Coagulation sodium citrate 3.2% 13x75 blue cap-black ring, sandwich tube, PREMIUM",
  "454334": "VACUETTE® TUBE 3 ml 9NC Coagulation sodium citrate 3.2% 13x75 blue cap-black ring, sandwich tube, non-ridged",
  "454351": "VACUETTE® TUBE 3 ml 9NC Coagulation sodium citrate 3.2% 13x75 light blue cap-black ring, sandwich tube, non-ridged",

  // Coagulation 9NC 3.8%
  "454381": "VACUETTE® TUBE 2 ml 9NC Coagulation sodium citrate 3.8% 13x75 blue cap-white ring, sandwich tube, PREMIUM",
  "454385": "VACUETTE® TUBE 3 ml 9NC Coagulation sodium citrate 3.8% 13x75 blue cap-black ring, sandwich tube, PREMIUM",
  "454387": "VACUETTE® TUBE 3.5 ml 9NC Coagulation sodium citrate 3.8% 13x75 blue cap-black ring, sandwich tube, PREMIUM",
  "454392": "VACUETTE® TUBE 3.5 ml 9NC Coagulation sodium citrate 3.8% 13x75 blue cap-black ring, sandwich tube, non-ridged",
  "455382": "VACUETTE® TUBE 9 ml 9NC Coagulation sodium citrate 3.8% 16x100 blue cap-black ring, non-ridged",

  // CTAD
  "454064": "VACUETTE® TUBE 3.5 ml 9NC Coagulation sodium citrate 3.2%, CTAD 13x75 blue cap-yellow ring, sandwich tube, PREMIUM",
  "474065": "VACUETTE® TUBE 2 ml 9NC Coagulation sodium citrate 3.2%, CTAD 13x75 blue cap-yellow ring, sandwich tube, PREMIUM",

  // K2EDTA
  "454024": "VACUETTE® TUBE 2 ml K2E K2EDTA 13x75 lavender cap-white ring, PREMIUM",
  "454047": "VACUETTE® TUBE 2 ml K2E K2EDTA 13x75 lavender cap-white ring, non-ridged",
  "454052": "VACUETTE® TUBE 1 ml K2E K2EDTA 13x75 lavender cap-white ring, non-ridged",
  "454020": "VACUETTE® TUBE 3 ml K2E K2EDTA 13x75 lavender cap-black ring, PREMIUM",
  "454023": "VACUETTE® TUBE 4 ml K2E K2EDTA 13x75 lavender cap-black ring, PREMIUM",
  "454032": "VACUETTE® TUBE 4 ml K2E K2EDTA 13x75 lavender cap-yellow ring, PREMIUM",
  "454246": "VACUETTE® TUBE 3 ml K2E K2EDTA 13x75 lavender cap-black ring, non-ridged",
  "454208": "VACUETTE® TUBE 4 ml K2E K2EDTA 13x75 pink cap-black ring, non-ridged",
  "454209": "VACUETTE® TUBE 4 ml K2E K2EDTA 13x75 lavender cap-black ring, non-ridged",
  "456002": "VACUETTE® TUBE 6 ml K2E K2EDTA 13x100 lavender cap-black ring, non-ridged",

  // K3EDTA
  "454034": "VACUETTE® TUBE 1 ml K3E K3EDTA 13x75 lavender cap-white ring, PREMIUM",
  "454087": "VACUETTE® TUBE 2 ml K3E K3EDTA 13x75 lavender cap-white ring, PREMIUM",
  "454222": "VACUETTE® TUBE 2 ml K3E K3EDTA 13x75 lavender cap-white ring, non-ridged",
  "474087": "VACUETTE® TUBE 2 ml K3E K3EDTA 13x75 lavender cap-white ring, transparent label, PREMIUM",
  "454086": "VACUETTE® TUBE 3 ml K3E K3EDTA 13x75 lavender cap-black ring, PREMIUM",
  "454217": "VACUETTE® TUBE 3 ml K3E K3EDTA 13x75 lavender cap-black ring, non-ridged",
  "454015": "VACUETTE® TUBE 3 ml K3E K3EDTA 13x75 lavender cap-red ring, non-ridged",
  "454022": "VACUETTE® TUBE 3 ml K3E K3EDTA 13x75 red cap-black ring, non-ridged",
  "454021": "VACUETTE® TUBE 4 ml K3E K3EDTA 13x75 lavender cap-black ring, non-ridged",
  "456003": "VACUETTE® TUBE 6 ml K3E K3EDTA 13x100 pink cap-black ring, non-ridged",
  "456038": "VACUETTE® TUBE 6 ml K3E K3EDTA 13x100 lavender cap-black ring, non-ridged",
  "456074": "VACUETTE® TUBE 6 ml K3E K3EDTA 13x100 white cap-black ring, non-ridged",

  // K2EDTA Separator
  "454235": "VACUETTE® TUBE 3.5 ml K2E K2EDTA Separator 13x75 lavender cap-yellow ring, PREMIUM",
  "456011": "VACUETTE® TUBE 5 ml K2E K2EDTA Separator 13x100 lavender cap-yellow ring, non-ridged",
  "456058": "VACUETTE® TUBE 5 ml K2E K2EDTA Separator 13x100 lavender cap-yellow ring, non-ridged",

  // LH Lithium Heparin
  "454081": "VACUETTE® TUBE 1 ml LH Lithium Heparin 13x75 green cap-white ring, PREMIUM",
  "454089": "VACUETTE® TUBE 2 ml LH Lithium Heparin 13x75 green cap-white ring, PREMIUM",
  "454237": "VACUETTE® TUBE 2 ml LH Lithium Heparin 13x75 green cap-white ring, non-ridged",
  "454244": "VACUETTE® TUBE 3 ml LH Lithium Heparin 13x75 green cap-black ring, non-ridged",
  "454029": "VACUETTE® TUBE 4 ml LH Lithium Heparin 13x75 green cap-black ring, non-ridged",
  "484589": "VACUETTE® TUBE 2 ml LH Lithium Heparin 13x75 green cap-white ring, G-barcode label, PREMIUM",
  "486508": "VACUETTE® TUBE 6 ml LH Lithium Heparin 13x100 green cap-black ring, G-barcode label, PREMIUM",

  // LH Lithium Heparin Separator
  "454008": "VACUETTE® TUBE 3.5 ml LH Lithium Heparin Separator 13x75 green cap-yellow ring, non-ridged",
  "454083": "VACUETTE® TUBE 3 ml LH Lithium Heparin Separator 13x75 green cap-yellow ring, PREMIUM",
  "454247": "VACUETTE® TUBE 3 ml LH Lithium Heparin Separator 13x75 green cap-yellow ring, non-ridged",
  "454493": "VACUETTE® TUBE 3 ml LH Lithium Heparin Separator 13x75 mint green cap-yellow ring, non-ridged",
  "456289": "VACUETTE® TUBE 5 ml LH Lithium Heparin Separator 13x100 mint green cap-yellow ring, special label, non-ridged",
  "486507": "VACUETTE® TUBE 5 ml LH Lithium Heparin Separator 13x100 green cap-yellow ring, G-barcode label, non-ridged",
  "484493": "VACUETTE® TUBE 3 ml LH Lithium Heparin Separator 13x75 mint green cap-yellow ring, G-barcode label, non-ridged",

  // NH Sodium Heparin
  "454030": "VACUETTE® TUBE 4 ml NH Sodium Heparin 13x75 green cap-green ring, non-ridged",
  "454051": "VACUETTE® TUBE 4 ml NH Sodium Heparin 13x75 green cap-green ring, PREMIUM",
  "455051": "VACUETTE® TUBE 9 ml NH Sodium Heparin 16x100 green cap-green ring, non-ridged",

  // CAT Serum Clot Activator
  "454098": "VACUETTE® TUBE 1 ml CAT Serum Clot Activator 13x75 red cap-white ring, PREMIUM",
  "454096": "VACUETTE® TUBE 2 ml CAT Serum Clot Activator 13x75 red cap-white ring, PREMIUM",
  "454236": "VACUETTE® TUBE 2 ml CAT Serum Clot Activator 13x75 red cap-white ring, non-ridged",
  "454095": "VACUETTE® TUBE 3.5 ml CAT Serum Clot Activator 13x75 red cap-black ring, PREMIUM",

  // CAT Serum Separator Clot Activator (gel)
  "454028": "VACUETTE® TUBE 3.5 ml CAT Serum Separator Clot Activator 13x75 red cap-yellow ring, PREMIUM",
  "454067": "VACUETTE® TUBE 3.5 ml CAT Serum Separator Clot Activator 13x75 red cap-yellow ring, PREMIUM",
  "454071": "VACUETTE® TUBE 3.5 ml CAT Serum Separator Clot Activator 13x75 red cap-yellow ring, non-ridged",
  "454205": "VACUETTE® TUBE 5 ml CAT Serum Separator Clot Activator 13x100 red cap-yellow ring, PREMIUM",
  "454214": "VACUETTE® TUBE 5 ml CAT Serum Separator Clot Activator 13x100 red cap-yellow ring, non-ridged",
  "454243": "VACUETTE® TUBE 3.5 ml CAT Serum Separator Clot Activator 13x75 red cap-yellow ring, non-ridged",
  "456073": "VACUETTE® TUBE 5 ml CAT Serum Separator Clot Activator 13x100 red cap-yellow ring, non-ridged",
  "456292": "VACUETTE® TUBE 4 ml CAT Serum Separator Clot Activator 13x100 red cap-yellow ring, non-ridged",

  // FAST Serum CAT
  "454593": "VACUETTE® TUBE 3.5 ml CAT Serum Fast Separator 13x75 orange cap-yellow ring, non-ridged",

  // Glucose
  "454061": "VACUETTE® TUBE 2 ml FX Sodium Fluoride / Potassium Oxalate 13x75 grey cap-white ring, PREMIUM",
  "454238": "VACUETTE® TUBE 2 ml FX Sodium Fluoride / Potassium Oxalate 13x75 grey cap-white ring, non-ridged",
  "454297": "VACUETTE® TUBE 4 ml FX Sodium Fluoride / Potassium Oxalate 13x75 grey cap-black ring, non-ridged",
  "456020": "VACUETTE® TUBE 5.5 ml FX Sodium Fluoride / Potassium Oxalate 13x100 grey cap-black ring, non-ridged",
  "454085": "VACUETTE® TUBE 2 ml FE Sodium Fluoride / K3EDTA 13x75 grey cap-white ring, PREMIUM",
  "454221": "VACUETTE® TUBE 2 ml FE Sodium Fluoride / K3EDTA 13x75 grey cap-white ring, non-ridged",
  "454033": "VACUETTE® TUBE 4 ml FE Sodium Fluoride / K3EDTA 13x75 grey cap-black ring, non-ridged",
  "454091": "VACUETTE® TUBE 4 ml FE Sodium Fluoride / K3EDTA 13x75 grey cap-black ring, PREMIUM",

  // Z No Additive
  "454088": "VACUETTE® TUBE 2 ml Z No Additive 13x75 white cap-white ring, PREMIUM",
  "455001": "VACUETTE® TUBE 9 ml Z No Additive 16x100 white cap-black ring, non-ridged",

  // Pre-barcoded Premium
  "484509": "VACUETTE® TUBE 2 ml K3E K3EDTA 13x75 lavender cap-white ring, G-barcode label, PREMIUM",
  "484520": "VACUETTE® TUBE 2 ml FE Sodium Fluoride / K3EDTA 13x75 grey cap-white ring, G-barcode label, PREMIUM",
  "484528": "VACUETTE® TUBE 2 ml FX Sodium Fluoride / Potassium Oxalate 13x75 grey cap-white ring, G-barcode label, non-ridged",
  "484531": "VACUETTE® TUBE 4 ml NH Sodium Heparin 13x75 green cap-green ring, G-barcode label, PREMIUM",

  // Urine
  "454141": "VACUETTE® TUBE 9 ml Z Urine No Additive 16x100 yellow cap-yellow ring, Round Base, PREMIUM",
  "455028": "VACUETTE® TUBE 9 ml Z Urine No Additive 16x100 yellow cap-yellow ring, Conical Base, non-ridged",
  "455007": "VACUETTE® TUBE 10 ml Z Urine No Additive 16x100 yellow cap-yellow ring, Round Base, non-ridged",
  "456065": "VACUETTE® TUBE 9 ml Z Urine No Additive 16x100 yellow cap-yellow ring, Conical Base, non-ridged",
  "454486": "VACUETTE® TUBE 4 ml Urine CCM 13x75 yellow cap-black ring, Round Base, non-ridged",
  "455048": "VACUETTE® TUBE 6 ml Urine Stabilur 16x100 yellow cap-red ring, non-ridged",

  // MiniCollect EDTA
  "450530": "MiniCollect® TUBE 0.25 / 0.5 ml K3E K3EDTA lavender cap",
  "450531": "MiniCollect® TUBE 1 ml K3E K3EDTA lavender cap",
  "450532": "MiniCollect® TUBE 0.25 / 0.5 ml K2E K2EDTA lavender cap",
  "450533": "MiniCollect® TUBE 0.25 / 0.5 ml CAT Serum Sep Clot Activator gold cap",
  "450548": "MiniCollect® TUBE 0.8 ml CAT Serum Sep Clot Activator gold cap",

  // Trace Elements
  "456080": "VACUETTE® TUBE 6 ml NH Trace Elements Sodium Heparin 13x100 royal blue cap-black ring, PREMIUM",
  "456275": "VACUETTE® TUBE 6 ml NH Trace Elements Sodium Heparin 13x100 royal blue cap-black ring, non-ridged",

  // ACD-A / ACD-B / blood grouping
  "456055": "VACUETTE® TUBE 6 ml ACD-A 13x100 yellow cap-black ring, PREMIUM",
  "455055": "VACUETTE® TUBE 9 ml ACD-A 16x100 yellow cap-black ring, non-ridged",
  "456094": "VACUETTE® TUBE 6 ml ACD-B 13x100 yellow cap-black ring, PREMIUM",

  // Crossmatch K3EDTA
  "456052": "VACUETTE® TUBE 6 ml K3E Crossmatch K3EDTA 13x100 pink cap-black ring, special label, non-ridged",
  "456093": "VACUETTE® TUBE 6 ml K3E Crossmatch K3EDTA 13x100 pink cap-black ring, special label, PREMIUM",
  "456242": "VACUETTE® TUBE 6 ml K3E Crossmatch K3EDTA 13x100 pink cap-black ring, special label, non-ridged",
  "456252": "VACUETTE® TUBE 6 ml K3E Crossmatch K3EDTA 13x100 pink cap-black ring, special label, non-ridged",

  // Z Discard
  "456202": "VACUETTE® TUBE 5 ml Z Discard Tube 13x100 black cap-red ring, non-ridged",

  // Z No Additive (extra sizes)
  "456001": "VACUETTE® TUBE 6 ml Z No Additive 13x100 white cap-black ring, non-ridged",

  // CAT Serum Sep Clot Activator (extra sizes)
  "456092": "VACUETTE® TUBE 6 ml CAT Serum Clot Activator 13x100 red cap-black ring, PREMIUM",
  "456292": "VACUETTE® TUBE 4 ml CAT Serum Separator Clot Activator 13x100 red cap-yellow ring, non-ridged",

  // Pre-barcoded serum
  "484514": "VACUETTE® TUBE 3.5 ml CAT Serum Separator Clot Activator 13x75 red cap-yellow ring, G-barcode label, PREMIUM",
  "486504": "VACUETTE® TUBE 6 ml CAT Serum Clot Activator 13x100 red cap-black ring, G-barcode label, PREMIUM",
  "486089": "VACUETTE® TUBE 6 ml CAT Serum Clot Activator 13x100 red cap-black ring, G-barcode label, PREMIUM",
  "484511": "VACUETTE® TUBE 3 ml K3E K3EDTA 13x75 lavender cap-black ring, G-barcode label, PREMIUM",
  "484510": "VACUETTE® TUBE 4 ml K3E K3EDTA 13x75 lavender cap-black ring, G-barcode label, PREMIUM",
  "495045": "VACUETTE® TUBE 9 ml K2E K2EDTA 16x100 lavender cap-black ring, G-Bi-Barcode label, non-ridged",

  // Urine extras
  "454141": "VACUETTE® TUBE 3 ml Z Urine No Additive 13x75 yellow cap-yellow ring, Round Base, PREMIUM",
  "454142": "VACUETTE® TUBE 4 ml Z Urine No Additive 13x75 black cap-black ring, Round Base, non-ridged",
  "456007": "VACUETTE® TUBE 6 ml Z Urine No Additive 13x100 yellow cap-yellow ring, Round Base, PREMIUM",
  "455243": "VACUETTE® TUBE 9 ml Urine CCM 16x100 yellow cap-black ring, Conical Base, non-ridged",
  "455052": "VACUETTE® TUBE 10 ml Urine CCM 16x100 yellow cap-black ring, Round Base, non-ridged",

  // Pre-barcoded urine
  "495007": "VACUETTE® TUBE 10 ml Z Urine No Additive 16x100 yellow cap-yellow ring, G-barcode label, Round Base, non-ridged",
};
for (const [k, v] of Object.entries(MANUAL)) {
  if (!map[k] || (map[k] && v.length > map[k].length)) map[k] = v;
}

writeFileSync("/tmp/rceth/sku-map.json", JSON.stringify(map, null, 2));
console.log(
  "Saved",
  Object.keys(map).length,
  "SKUs to /tmp/rceth/sku-map.json"
);
