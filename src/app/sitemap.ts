/**
 * Multilingual sitemap with `xhtml:link` (hreflang) alternates per URL,
 * Google image-sitemap extensions, and ISO-8601 `lastmod` timestamps.
 *
 * One <url> entry per logical page; the canonical `loc` is the RU version
 * (default locale), and `alternates.languages` lists every locale variant
 * plus `x-default`. This is what Google and Yandex expect for hreflang
 * consolidation — duplicating each URL three times would split signals.
 *
 * Image extension: every URL that has a representative image (product
 * photos, category illustrations, manufacturer logos, blog covers) emits
 * `<image:image>` so Google Image Search and Yandex.Картинки can index it.
 *
 * Canonicality: URLs are absolute against `NEXT_PUBLIC_SITE_URL`. Make
 * sure that value matches the production host (e.g. `https://www.viena.by`),
 * otherwise every URL in the sitemap will redirect on first hit and Yandex
 * will flag the file.
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
 *  - /blog
 *  - /blog/[slug]
 *  - /faq
 *  - /contacts
 */
import type { MetadataRoute } from "next";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.viena.by";

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

type Product = {
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
};
type Category = { id: string; image?: string };
type Manufacturer = { slug: string; logo?: string };
type Project = { id: string };
type BlogPost = {
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
};

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
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Build a sitemap entry with hreflang alternates for one logical URL.
 *
 * `images` are absolutized against SITE_URL and emitted as
 * <image:image> children of the <url> element by Next.js.
 */
function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified: Date | string,
  images?: string[]
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[HREFLANG[l]] = abs(`/${l}${path === "/" ? "" : path}`);
  }
  languages["x-default"] = abs(
    `/${DEFAULT_LOCALE}${path === "/" ? "" : path}`
  );
  const result: MetadataRoute.Sitemap[number] = {
    url: abs(`/${DEFAULT_LOCALE}${path === "/" ? "" : path}`),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  };
  const imgs = (images ?? [])
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .map(abs);
  if (imgs.length > 0) {
    result.images = Array.from(new Set(imgs)).slice(0, 1000);
  }
  return result;
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

  const blogPosts = readJson<BlogPost[]>(join(dataDir, "blog.json"));
  const blogMTime = fileMtime(join(dataDir, "blog.json"));
  const faqMTime = fileMtime(join(dataDir, "faq.json"));
  const aboutMTime = fileMtime(join(process.cwd(), "src/app/[locale]/about/page.tsx"));
  const homeMTime = new Date(
    Math.max(
      categoriesMTime.valueOf(),
      manufacturersMTime.valueOf(),
      blogMTime.valueOf()
    )
  );

  const homeImages = categories
    .map((c) => c.image)
    .filter((s): s is string => typeof s === "string");

  const staticPages: MetadataRoute.Sitemap = [
    entry("/", "weekly", 1, homeMTime, homeImages.slice(0, 6)),
    entry("/catalog", "weekly", 0.95, categoriesMTime, homeImages),
    entry("/manufacturers", "weekly", 0.85, manufacturersMTime, [
      ...manufacturers
        .map((m) => m.logo)
        .filter((s): s is string => typeof s === "string")
        .slice(0, 30),
    ]),
    entry("/services", "monthly", 0.75, fileMtime(join(dataDir, "services.json"))),
    entry("/projects", "monthly", 0.75, projectsMTime),
    entry("/projects/moh", "monthly", 0.8, fileMtime(join(dataDir, "moh-letters.json"))),
    entry("/about", "monthly", 0.7, aboutMTime),
    entry("/blog", "weekly", 0.85, blogMTime, [
      ...blogPosts
        .map((p) => p.image)
        .filter((s): s is string => typeof s === "string")
        .slice(0, 30),
    ]),
    entry("/faq", "monthly", 0.75, faqMTime),
    entry("/contacts", "yearly", 0.6, fileMtime(join(process.cwd(), "src/app/[locale]/contacts/page.tsx"))),
  ];

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => {
    const updatedAt = p.updatedAt || p.publishedAt;
    const lastMod = new Date(updatedAt);
    return entry(
      `/blog/${p.slug}`,
      "monthly",
      0.7,
      isNaN(lastMod.valueOf()) ? blogMTime : lastMod,
      p.image ? [p.image] : undefined
    );
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => {
    const file = join(productsDir, `${c.id}.json`);
    return entry(
      `/catalog/${c.id}`,
      "weekly",
      0.85,
      fileMtime(file),
      c.image ? [c.image] : undefined
    );
  });

  const manufacturerPages: MetadataRoute.Sitemap = manufacturers.map((m) =>
    entry(
      `/manufacturers/${m.slug}`,
      "monthly",
      0.7,
      manufacturersMTime,
      m.logo ? [m.logo] : undefined
    )
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
      const updatedAt = p.updatedAt || p.createdAt;
      const lastMod = updatedAt ? new Date(updatedAt) : fileMTime;
      productPages.push(
        entry(
          `/catalog/${categoryId}/${p.slug}`,
          "monthly",
          0.55,
          isNaN(lastMod.valueOf()) ? fileMTime : lastMod,
          p.images && p.images.length > 0 ? p.images.slice(0, 6) : undefined
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
    ...blogPages,
  ];
}
