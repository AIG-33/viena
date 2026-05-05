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
const blogPosts = JSON.parse(
  readFileSync(join(ROOT, "data/blog.json"), "utf8")
);
const faqGroups = JSON.parse(
  readFileSync(join(ROOT, "data/faq.json"), "utf8")
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

// FAQ section — pure text, easy for AI agents to extract direct answers.
const faqMd = `\n---\n\n# FAQ — частые вопросы (${SITE_URL}/ru/faq)\n\n${faqGroups
  .map((group) => {
    const items = group.items
      .map((it) => `### ${it.q}\n\n${it.a}`)
      .join("\n\n");
    return `## ${group.title}\n\n${items}`;
  })
  .join("\n\n")}\n`;

// Blog section — emit each post as Markdown so AI agents can cite the
// underlying ISO/CLSI/WHO references directly.
const blogMd = `\n---\n\n# Блог (${SITE_URL}/ru/blog)\n\nЭкспертные статьи со ссылками на международные стандарты (ISO 6710, ISO 11137, CLSI, WHO) и рецензируемые публикации.\n\n${blogPosts
  .map((post) => {
    const url = `${SITE_URL}/ru/blog/${post.slug}`;
    const tags = post.tags?.length ? ` · ${post.tags.join(" · ")}` : "";
    const renderBlock = (b) => {
      if (b.type === "p") return b.text;
      if (b.type === "h2") return `\n## ${b.text}\n`;
      if (b.type === "h3") return `\n### ${b.text}\n`;
      if (b.type === "ul")
        return b.items.map((i) => `- ${i}`).join("\n");
      if (b.type === "ol")
        return b.items.map((i, idx) => `${idx + 1}. ${i}`).join("\n");
      if (b.type === "blockquote")
        return `> ${b.text}${b.cite ? `\n> — ${b.cite}` : ""}`;
      if (b.type === "callout")
        return `**${b.title || "Заметка"}:** ${b.text}`;
      return "";
    };
    const body = post.body.map(renderBlock).join("\n\n");
    const refs = (post.references ?? [])
      .map(
        (r, idx) =>
          `${idx + 1}. [${r.title}](${r.url})${r.publisher ? ` — ${r.publisher}` : ""}`
      )
      .join("\n");
    return `## ${post.title}\n\n_${post.publishedAt}${tags}_\n\n**URL:** ${url}\n\n${post.excerpt}\n\n${body}\n\n**Источники:**\n\n${refs}`;
  })
  .join("\n\n---\n\n")}\n`;

const out = header + "\n" + sections.join("\n") + faqMd + blogMd;
const outPath = join(ROOT, "public/llms-full.txt");
writeFileSync(outPath, out, "utf8");

const sizeKb = (Buffer.byteLength(out, "utf8") / 1024).toFixed(1);
console.log(`Wrote ${outPath}`);
console.log(`Products       : ${products.length}`);
console.log(`Blog posts     : ${blogPosts.length}`);
console.log(`FAQ groups     : ${faqGroups.length}`);
console.log(`Size           : ${sizeKb} KiB`);
