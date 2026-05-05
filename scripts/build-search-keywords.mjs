#!/usr/bin/env node
// Generate `searchKeywords` for every product in data/products/*.json
// from data/seo-synonyms.json. Variant C: bulk, dictionary-based, no AI.
//
// Run: node scripts/build-search-keywords.mjs
//      node scripts/build-search-keywords.mjs --dry  (no writes, prints stats)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PRODUCTS_DIR = join(ROOT, "data/products");
const SYN_PATH = join(ROOT, "data/seo-synonyms.json");
const DRY = process.argv.includes("--dry");

const synonyms = JSON.parse(readFileSync(SYN_PATH, "utf8"));

/** Lowercase normalize for matching (NFKD-style, drop punctuation/spaces). */
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[®©™]/g, "")
    .replace(/[^a-zа-яё0-9]+/giu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniq(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = norm(x);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(String(x).trim());
  }
  return out;
}

/** Pull "Подкатегория" value from specs[]. */
function pickSubcategory(product) {
  if (!Array.isArray(product.specs)) return null;
  const found = product.specs.find((s) => s && s.key === "Подкатегория");
  return found && found.value ? String(found.value) : null;
}

/** Build searchKeywords for a single product. */
function buildKeywords(product) {
  const name = String(product.name || "");
  const nameNorm = norm(name);
  const out = [];

  const cat = product.categoryId;
  if (cat && synonyms.byCategory[cat]) {
    out.push(...synonyms.byCategory[cat]);
  }

  const sub = pickSubcategory(product);
  if (sub && synonyms.bySubcategory[sub]) {
    out.push(...synonyms.bySubcategory[sub]);
  }

  for (const [token, words] of Object.entries(synonyms.byToken || {})) {
    if (nameNorm.includes(norm(token))) {
      out.push(...words);
    }
  }

  const mfr = product.manufacturer;
  if (mfr && synonyms.byManufacturer[mfr]) {
    out.push(...synonyms.byManufacturer[mfr]);
  }

  if (Array.isArray(product.tags)) {
    for (const t of product.tags) if (t) out.push(String(t));
  }

  // Drop tokens identical to product name (no SEO value).
  const filtered = out.filter((s) => norm(s) !== nameNorm);
  return uniq(filtered);
}

const stats = {
  files: 0,
  productsTotal: 0,
  productsUpdated: 0,
  productsNoKeywords: 0,
  totalKeywords: 0,
  perCategory: {},
};

const files = readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));
for (const file of files) {
  stats.files++;
  const path = join(PRODUCTS_DIR, file);
  const items = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(items)) continue;

  let touched = 0;
  for (const p of items) {
    stats.productsTotal++;
    const kw = buildKeywords(p);
    if (kw.length === 0) {
      stats.productsNoKeywords++;
      continue;
    }
    const prev = Array.isArray(p.searchKeywords) ? p.searchKeywords : null;
    const prevKey = prev ? prev.join("|") : "";
    const newKey = kw.join("|");
    if (prevKey !== newKey) {
      p.searchKeywords = kw;
      touched++;
    }
    stats.productsUpdated++;
    stats.totalKeywords += kw.length;
    stats.perCategory[p.categoryId] = stats.perCategory[p.categoryId] || {
      products: 0,
      keywords: 0,
    };
    stats.perCategory[p.categoryId].products++;
    stats.perCategory[p.categoryId].keywords += kw.length;
  }

  if (touched > 0 && !DRY) {
    writeFileSync(path, JSON.stringify(items, null, 2) + "\n", "utf8");
  }
}

const avg =
  stats.productsUpdated > 0
    ? (stats.totalKeywords / stats.productsUpdated).toFixed(1)
    : "0";

console.log(`Files scanned       : ${stats.files}`);
console.log(`Products total      : ${stats.productsTotal}`);
console.log(`Products with kw    : ${stats.productsUpdated}`);
console.log(`Products no kw      : ${stats.productsNoKeywords}`);
console.log(`Avg keywords/product: ${avg}`);
console.log("Per category:");
for (const [c, v] of Object.entries(stats.perCategory)) {
  console.log(
    `  ${c.padEnd(18)} products=${String(v.products).padStart(3)}  avg-kw=${(
      v.keywords / v.products
    ).toFixed(1)}`
  );
}
if (DRY) console.log("(dry run — files not written)");
