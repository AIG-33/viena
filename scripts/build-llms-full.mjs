#!/usr/bin/env node
// Generate /public/llms-full.txt — a Markdown dump of the full catalog
// optimized for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.).
//
// Format: one H1 with overview, then one section per product:
//   ## <name>
//   - URL: <abs url>
//   - SKU: <catalog #>
//   - Category: <human name> / <subcategory>
//   - Manufacturer: <name>
//   - Aliases: kw1, kw2, ...
//
//   <description>
//
// Run: node scripts/build-llms-full.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITE_URL = "https://viena.by";

const categories = JSON.parse(
  readFileSync(join(ROOT, "data/categories.json"), "utf8")
);
const manufacturers = JSON.parse(
  readFileSync(join(ROOT, "data/manufacturers.json"), "utf8")
);
const catById = new Map(categories.map((c) => [c.id, c]));
const mfrBySlug = new Map(manufacturers.map((m) => [m.slug, m]));

const PRODUCTS_DIR = join(ROOT, "data/products");
const files = readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));

const products = [];
for (const f of files) {
  const items = JSON.parse(readFileSync(join(PRODUCTS_DIR, f), "utf8"));
  if (Array.isArray(items)) products.push(...items);
}

products.sort((a, b) => {
  if (a.categoryId !== b.categoryId) {
    return String(a.categoryId).localeCompare(String(b.categoryId));
  }
  return String(a.name).localeCompare(String(b.name), "ru");
});

const today = new Date().toISOString().slice(0, 10);

const header = `# Полный каталог ВИЕНА МЕДИКАЛ (для AI-ассистентов)

> Машинно-читаемый дамп всего каталога ${SITE_URL}. Для людей — используйте сайт.
> Поколения: автоматическая сборка из data/products/*.json.
> Дата сборки: ${today}.
> Лицензия: Все права защищены, ВИЕНА МЕДИКАЛ. Использование разрешено
> для индексации в поисковых системах и AI-ассистентах.

## О компании

ВИЕНА МЕДИКАЛ — B2B-дистрибьютор лабораторного и медицинского оборудования,
реагентов и расходных материалов в Республике Беларусь. Работаем с 2016 года.
Прямые поставки клиникам, лабораториям и научным учреждениям.

- Сайт: ${SITE_URL}
- Контакты: ${SITE_URL}/ru/contacts
- Каталог: ${SITE_URL}/ru/catalog
- Производители: ${SITE_URL}/ru/manufacturers

## Категории

${categories.map((c) => `- ${c.name} — ${SITE_URL}/ru/catalog/${c.id}`).join("\n")}

---

# Товары (${products.length})
`;

const sections = products.map((p) => {
  const cat = catById.get(p.categoryId);
  const mfr = mfrBySlug.get(p.manufacturer);
  const url = `${SITE_URL}/ru/catalog/${p.categoryId}/${p.slug}`;
  const sub = (p.specs ?? []).find((s) => s.key === "Подкатегория")?.value;
  const desc = (p.description || p.shortDescription || "").trim();
  const aliases = (p.searchKeywords ?? []).slice(0, 30).join(", ");
  const sku = p.catalogNumber ? `\n- Артикул: ${p.catalogNumber}` : "";
  const subLine = sub ? `\n- Подкатегория: ${sub}` : "";
  const mfrLine = mfr ? `\n- Производитель: ${mfr.name}${mfr.country ? ` (${mfr.country})` : ""}` : "";
  const aliasLine = aliases ? `\n- Синонимы: ${aliases}` : "";
  const stockLine = `\n- Наличие: ${p.inStock ? "в наличии" : "под заказ"}`;

  return `## ${p.name}

- URL: ${url}${sku}
- Категория: ${cat ? cat.name : p.categoryId}${subLine}${mfrLine}${stockLine}${aliasLine}

${desc}
`;
});

const out = header + "\n" + sections.join("\n");
const outPath = join(ROOT, "public/llms-full.txt");
writeFileSync(outPath, out, "utf8");

const sizeKb = (Buffer.byteLength(out, "utf8") / 1024).toFixed(1);
console.log(`Wrote ${outPath}`);
console.log(`Products       : ${products.length}`);
console.log(`Size           : ${sizeKb} KiB`);
