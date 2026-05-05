/**
 * robots.txt — explicit allow-list for the bots we want indexing the site.
 *
 * We allow all conventional crawlers (Google / Yandex / Bing / Apple / DDG)
 * and the public AI crawlers (OpenAI, Anthropic, Perplexity, Common Crawl,
 * etc.) so the catalogue and `llms.txt` are picked up by AI search.
 *
 * `Disallow: /api/` keeps server-only endpoints (contact form) out of the
 * index — they have no SEO value and would only generate 405s.
 *
 * The `Sitemap` directive is the single source of truth for crawlers; the
 * catch-all entry at the bottom keeps non-listed bots well-behaved.
 *
 * `host` is a Yandex-specific hint — still respected by Яндекс.Вебмастер.
 */
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://viena.by";

const DEFAULT_ALLOW = "/";
const DEFAULT_DISALLOW = ["/api/"];

const ALLOWED_BOTS = [
  // Search engines.
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Applebot",
  "YandexBot",
  "YandexImages",
  "YandexMobileBot",
  "Yeti",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "TelegramBot",

  // AI crawlers (training + retrieval).
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Bingbot-Extended",
  "CCBot",
  "Amazonbot",
  "Bytespider",
  "DiffbotBot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "Mistral-AI",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ALLOWED_BOTS,
        allow: DEFAULT_ALLOW,
        disallow: DEFAULT_DISALLOW,
      },
      {
        userAgent: "*",
        allow: DEFAULT_ALLOW,
        disallow: DEFAULT_DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
