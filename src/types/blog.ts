/**
 * Blog post data model. Articles are stored as structured blocks (not raw
 * markdown) to keep parsing/rendering simple and XSS-safe — every block
 * type is rendered by an explicit React component, no `dangerouslySetInnerHTML`.
 *
 * Inline formatting inside `text` fields supports Markdown-style:
 *  - `[label](https://…)`        → link (target=_blank rel=noopener)
 *  - `**bold**`                   → <strong>
 *  - `*italic*`                   → <em>
 *  - `` `code` ``                 → <code>
 */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; text: string; cite?: string }
  | { type: "callout"; tone?: "info" | "warn" | "ok"; title?: string; text: string };

export interface BlogReference {
  title: string;
  url: string;
  publisher?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. "2026-04-15". */
  publishedAt: string;
  updatedAt?: string;
  author: string;
  /** Slug from data/categories.json, used to cross-link to the catalog. */
  categoryId?: string;
  tags: string[];
  readingMinutes: number;
  image?: string;
  keywords?: string[];
  body: BlogBlock[];
  references?: BlogReference[];
}
