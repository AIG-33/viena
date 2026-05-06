/**
 * robots.txt — explicit allow-list for the bots we want indexing the site.
 *
 * Strategy:
 *  - Conventional search engines (Google / Yandex / Bing / Apple / DDG /
 *    Naver) and AI crawlers are listed by name with `Allow: /` so the
 *    intent is explicit and Search Console / Webmaster shows the rule.
 *  - The catch-all `User-Agent: *` block carries the same allow-list as a
 *    fallback for any UA we didn't enumerate.
 *  - `Disallow: /api/` keeps the contact-form POST endpoint (only thing
 *    under /api) out of the index — it has no SEO value.
 *
 * Notes on directives:
 *  - `Sitemap:` is auto-discovered by every major crawler; this is the
 *    canonical location for both robots.txt and sitemap.xml.
 *  - `Host:` is legacy: Yandex deprecated it in 2018 and now picks the
 *    main mirror via 301-redirect. Kept here because it's harmless and
 *    still honoured by some mirroring services.
 *  - `Crawl-delay:` is ignored by Google; respected by Yandex/Bing/
 *    Bytespider. We don't set one — the catalogue is small (~260 URLs)
 *    and the bots haven't caused load.
 *
 * UA references:
 *  - Google     https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
 *  - Bing       https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0
 *  - Yandex     https://yandex.com/support/webmaster/robot-workings/check-yandex-robots.html
 *  - Apple      https://support.apple.com/en-us/119829
 *  - OpenAI     https://platform.openai.com/docs/bots
 *  - Anthropic  https://docs.anthropic.com/en/docs/agents-and-tools/web-fetch-tool
 *  - Perplexity https://docs.perplexity.ai/guides/bots
 *  - Meta       https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/
 *  - Common Crawl https://commoncrawl.org/big-picture/frequently-asked-questions/
 *  - Mistral    https://docs.mistral.ai/capabilities/web_search/
 *  - Cohere     https://docs.cohere.com/docs/web-search
 */
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.viena.by";

const DEFAULT_ALLOW = "/";
const DEFAULT_DISALLOW = ["/api/"];

const ALLOWED_BOTS = [
  // ── Search engines ─────────────────────────────────────────────────
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Bingbot",
  "Slurp",                       // Yahoo (legacy, still present)
  "DuckDuckBot",
  "Applebot",
  "YandexBot",
  "YandexImages",
  "YandexMobileBot",
  "Yeti",                        // Naver

  // ── Social link previews ───────────────────────────────────────────
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "TelegramBot",

  // ── AI crawlers (training + retrieval + search) ────────────────────
  "GPTBot",                      // OpenAI training
  "OAI-SearchBot",               // ChatGPT search index
  "ChatGPT-User",                // ChatGPT user-initiated fetch
  "ClaudeBot",                   // Anthropic crawler (current)
  "Claude-User",                 // Claude user-initiated fetch
  "Claude-SearchBot",            // Claude search index
  "anthropic-ai",                // Anthropic legacy UA — kept as defensive fallback
  "PerplexityBot",               // Perplexity index
  "Perplexity-User",             // Perplexity user-initiated fetch
  "Google-Extended",             // Google AI training opt-in token
  "Google-CloudVertexBot",       // Vertex AI grounding fetcher
  "Applebot-Extended",           // Apple AI training opt-in token
  "CCBot",                       // Common Crawl
  "Amazonbot",                   // Amazon (Alexa et al.)
  "Bytespider",                  // ByteDance / TikTok
  "Diffbot",                     // Diffbot crawler
  "FacebookBot",                 // Meta AI
  "Meta-ExternalAgent",          // Meta AI training
  "Meta-ExternalFetcher",        // Meta user-initiated fetch
  "MistralAI-User",              // Mistral web search retrieval
  "cohere-training-data-crawler",// Cohere training crawler
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
