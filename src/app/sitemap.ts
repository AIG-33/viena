import type { MetadataRoute } from "next";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://viena.by";

type Product = { slug: string };
type Category = { id: string };

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contacts`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const dataDir = join(process.cwd(), "data");
  const categories = readJson<Category[]>(join(dataDir, "categories.json"));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/catalog/${c.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productsDir = join(dataDir, "products");
  const productFiles = readdirSync(productsDir).filter((f) => f.endsWith(".json"));
  const productPages: MetadataRoute.Sitemap = [];
  for (const file of productFiles) {
    const categoryId = file.replace(/\.json$/, "");
    const products = readJson<Product[]>(join(productsDir, file));
    for (const p of products) {
      productPages.push({
        url: `${SITE_URL}/catalog/${categoryId}/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
