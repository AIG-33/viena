/**
 * Multilingual sitemap with `xhtml:link` (hreflang) alternates per URL.
 *
 * One <url> entry per logical page; the canonical `loc` is the RU version
 * (default locale), and `alternates.languages` lists every locale variant
 * plus `x-default`. This is what Google and Yandex expect for hreflang
 * consolidation — duplicating each URL three times would split signals.
 *
 * Routes covered:
 *  - /            (home)
 *  - /catalog     (catalog hub)
 *  - /catalog/[category]
 *  - /catalog/[category]/[product]
 *  - /manufacturers
 *  - /manufacturers/[slug]
 *  - /services
 *  - /projects
 *  - /projects/moh
 *  - /about
 *  - /contacts
 */
import type { MetadataRoute } from "next";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://viena.by";

// Mirrors src/i18n/routing.ts. Hard-coded here to keep this file
// pure-Node-friendly (no Next.js runtime imports during build).
const LOCALES = ["ru", "en", "zh"] as const;
const DEFAULT_LOCALE: (typeof LOCALES)[number] = "ru";

// hreflang labels Google understands. Keep in sync with HTML_LANG in the
// locale layout.
const HREFLANG: Record<(typeof LOCALES)[number], string> = {
  ru: "ru-BY",
  en: "en",
  zh: "zh-CN",
};

type Product = { slug: string; createdAt?: string };
type Category = { id: string };
type Manufacturer = { slug: string };
type Project = { id: string };

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function fileMtime(path: string): Date {
  try {
    return statSync(path).mtime;
  } catch {
    return new Date();
  }
}

function abs(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Build a sitemap entry with hreflang alternates for one logical URL.
 */
function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified: Date | string
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[HREFLANG[l]] = abs(`/${l}${path === "/" ? "" : path}`);
  }
  languages["x-default"] = abs(
    `/${DEFAULT_LOCALE}${path === "/" ? "" : path}`
  );
  return {
    url: abs(`/${DEFAULT_LOCALE}${path === "/" ? "" : path}`),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const dataDir = join(process.cwd(), "data");
  const productsDir = join(dataDir, "products");

  const categories = readJson<Category[]>(join(dataDir, "categories.json"));
  const manufacturers = readJson<Manufacturer[]>(
    join(dataDir, "manufacturers.json")
  );
  const projects = readJson<Project[]>(join(dataDir, "projects.json"));

  const categoriesMTime = fileMtime(join(dataDir, "categories.json"));
  const manufacturersMTime = fileMtime(join(dataDir, "manufacturers.json"));
  const projectsMTime = fileMtime(join(dataDir, "projects.json"));

  const staticPages: MetadataRoute.Sitemap = [
    entry("/", "weekly", 1, categoriesMTime),
    entry("/catalog", "weekly", 0.95, categoriesMTime),
    entry("/manufacturers", "weekly", 0.85, manufacturersMTime),
    entry("/services", "monthly", 0.75, fileMtime(join(dataDir, "services.json"))),
    entry("/projects", "monthly", 0.75, projectsMTime),
    entry("/projects/moh", "monthly", 0.8, fileMtime(join(dataDir, "moh-letters.json"))),
    entry("/about", "monthly", 0.7, projectsMTime),
    entry("/contacts", "yearly", 0.6, new Date("2024-01-01")),
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => {
    const file = join(productsDir, `${c.id}.json`);
    return entry(`/catalog/${c.id}`, "weekly", 0.85, fileMtime(file));
  });

  const manufacturerPages: MetadataRoute.Sitemap = manufacturers.map((m) =>
    entry(`/manufacturers/${m.slug}`, "monthly", 0.7, manufacturersMTime)
  );

  const productPages: MetadataRoute.Sitemap = [];
  const productFiles = readdirSync(productsDir).filter((f) =>
    f.endsWith(".json")
  );
  for (const file of productFiles) {
    const categoryId = file.replace(/\.json$/, "");
    const filePath = join(productsDir, file);
    const fileMTime = fileMtime(filePath);
    const products = readJson<Product[]>(filePath);
    for (const p of products) {
      const lastMod = p.createdAt ? new Date(p.createdAt) : fileMTime;
      productPages.push(
        entry(
          `/catalog/${categoryId}/${p.slug}`,
          "monthly",
          0.55,
          isNaN(lastMod.valueOf()) ? fileMTime : lastMod
        )
      );
    }
  }

  // Project detail pages — only emit if the route handler exists. Right
  // now `/projects/[id]` isn't implemented as a separate page (we only
  // have `/projects/moh`), so we skip individual projects to avoid 404s.
  // Re-enable when project detail pages ship.
  void projects;

  return [
    ...staticPages,
    ...categoryPages,
    ...manufacturerPages,
    ...productPages,
  ];
}
