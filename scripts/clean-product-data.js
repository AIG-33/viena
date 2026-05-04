/* eslint-disable */
/**
 * Clean garbage in product descriptions and set canonical `manufacturer` (slug) on every product.
 *
 * - Strips long runs of `аааа` / `ffff` (scrape artefacts).
 * - Fixes broken words: `высокоПроизводитель ного` → `высокопроизводительного`,
 *   `Произв(o|о)дитель ность(ью)?` → `производительность`/`производительностью`.
 * - Strips trailing `Производитель …`, `Скачать брошюру`, `Полное описание`,
 *   `Тесты к анализатору`, `Сопутствующие товары:` blocks from descriptions and
 *   uses them to detect the manufacturer.
 * - Maps detected manufacturer to the slug from data/manufacturers.json.
 * - Fixes vet-004 corrupt manufacturer field.
 * - Idempotent: running twice produces the same files.
 *
 * Usage: node scripts/clean-product-data.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT, "data", "products");
const MANUFACTURERS_PATH = path.join(ROOT, "data", "manufacturers.json");

const manufacturers = JSON.parse(fs.readFileSync(MANUFACTURERS_PATH, "utf8"));

/** Build name → slug lookup from `matches` arrays (lowercased). Longest first. */
const matchTable = [];
for (const m of manufacturers) {
  for (const needle of m.matches || []) {
    matchTable.push({ needle: needle.toLowerCase(), slug: m.slug });
  }
  matchTable.push({ needle: m.name.toLowerCase(), slug: m.slug });
}
matchTable.sort((a, b) => b.needle.length - a.needle.length);

function detectManufacturer(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const { needle, slug } of matchTable) {
    if (lower.includes(needle)) return slug;
  }
  return null;
}

/** Default manufacturer per category when description gives no clue. */
const CATEGORY_DEFAULT = {
  "vacuum-systems": "greiner-bio-one",
  pathomorphology: "biovitrum",
  lancets: "lianfa",
  reagents: "amplisens",
  consumables: "huida",
};

/** Clean a single description/shortDescription string. */
function cleanText(input) {
  if (!input || typeof input !== "string") return input;
  let s = input;

  s = s.replace(/высокоПроизводитель\s*ного/gi, "высокопроизводительного");
  s = s.replace(/Произв[оo]дитель\s+ностью/gi, "производительностью");
  s = s.replace(/Произв[оo]дитель\s+ность/gi, "производительность");

  s = s.replace(/(^|[\s,.;:()])([аa]{3,})(?=\s|$)/gi, "$1");
  s = s.replace(/(^|[\s,.;:()])(f{4,})(?=\s|$)/gi, "$1");

  s = s.replace(/\s*Скачать брошюру\s*/gi, " ");
  s = s.replace(/\s*Полное описание\s+Тесты к анализатору\s*/gi, " ");
  s = s.replace(/\s*Полное описание(?=\s|$)/gi, " ");
  s = s.replace(/\s*Тесты к анализатору(?=\s|$)/gi, " ");

  s = s.replace(/\s*Сопутствующие товары:.*$/i, "");

  const trailingPatterns = [
    /\s+Производитель\s+[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s\-®.,'’]*?(?:\s+(?:GmbH|Inc\.?|Ltd\.?|Co\.?,?\s*Ltd\.?|B\.V\.?|Corp\.?|Corporation))?\s*$/i,
    /\s+Производитель\s+[A-Za-zА-Яа-яЁё®]+\s*$/i,
  ];
  for (const re of trailingPatterns) {
    const match = s.match(re);
    if (!match) continue;
    const tailLen = match[0].length;
    const remaining = s.length - tailLen;
    if (remaining >= 40) {
      s = s.slice(0, remaining);
    }
  }

  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function processProduct(p, categoryFile) {
  const before = JSON.stringify(p);

  const detectedFromDesc =
    detectManufacturer(p.description) || detectManufacturer(p.shortDescription);
  const detectedFromName =
    detectManufacturer(p.name) || detectManufacturer(p.slug);

  if (categoryFile !== "scientific-reagents") {
    if (p.shortDescription) p.shortDescription = cleanText(p.shortDescription);
    if (p.description) p.description = cleanText(p.description);
  }

  if (categoryFile === "scientific-reagents") {
    const fromName = detectManufacturer(p.name);
    if (fromName) {
      p.manufacturer = fromName;
    } else {
      const slug = (p.slug || "").toLowerCase();
      const found = manufacturers.find((m) => m.slug === slug);
      if (found) p.manufacturer = found.slug;
    }
  } else {
    let chosen = detectedFromDesc || detectedFromName;
    if (!chosen) chosen = CATEGORY_DEFAULT[categoryFile] || null;
    if (chosen) p.manufacturer = chosen;
    else if (p.manufacturer && typeof p.manufacturer === "string") {
      const fromExisting = detectManufacturer(p.manufacturer);
      if (fromExisting) p.manufacturer = fromExisting;
      else delete p.manufacturer;
    }
  }

  const after = JSON.stringify(p);
  return after !== before;
}

function main() {
  const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));
  let totalProducts = 0;
  let totalChanged = 0;
  const perCategory = {};

  for (const file of files) {
    const categoryFile = file.replace(".json", "");
    const fullPath = path.join(PRODUCTS_DIR, file);
    const arr = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    let changed = 0;

    for (const p of arr) {
      totalProducts++;
      const wasChanged = processProduct(p, categoryFile);
      if (wasChanged) {
        changed++;
        totalChanged++;
      }
    }

    fs.writeFileSync(fullPath, JSON.stringify(arr, null, 2) + "\n", "utf8");
    perCategory[categoryFile] = { total: arr.length, changed };
  }

  console.log("Manufacturers loaded:", manufacturers.length);
  console.log("Match rules:", matchTable.length);
  console.log("");
  for (const [cat, stat] of Object.entries(perCategory)) {
    console.log(
      `  ${cat.padEnd(22)} total=${String(stat.total).padStart(4)}  changed=${String(stat.changed).padStart(4)}`
    );
  }
  console.log("");
  console.log(`Total products: ${totalProducts}`);
  console.log(`Total changed:  ${totalChanged}`);
}

main();
