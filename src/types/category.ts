export interface CategoryFaq {
  q: string;
  a: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
  productCount?: number;
  /**
   * SEO overrides. All optional — when missing, the page falls back to
   * `name` and `description`. Used by `generateMetadata` and the long-form
   * SEO content block on the category landing page.
   */
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  /** Long-form intro paragraph rendered under H1 (HTML-safe plain text). */
  intro?: string;
  /** Q&A pairs; rendered as a section + emitted as FAQPage JSON-LD. */
  faqs?: CategoryFaq[];
  /**
   * Optional override for the tile/CTA target. When set, the tile links to
   * this URL (internal or absolute) instead of the default
   * `/catalog/<id>`. Use it for non-SKU categories such as partner
   * solutions or affiliate shop redirects (e.g. `/solutions/mednais`).
   * `generateStaticParams` for `/catalog/[category]` skips entries with
   * `link` so no empty category page is ever generated.
   */
  link?: string;
  /**
   * Short, all-caps tag rendered as a colored badge on the tile
   * (top-right corner). Use sparingly — keep ≤ 8 characters. Examples:
   * "Новинка", "NEW", "Beta".
   */
  badge?: string;
  /**
   * Optional override for the product-count badge shown at the bottom of
   * the catalog tile. When set, it replaces the auto-computed
   * `{count} {productsLabel}` text. Use it for categories whose actual
   * SKU set lives outside the on-site catalog (e.g. partner shops with
   * tens of thousands of items) where the dynamic count would mislead.
   */
  productCountLabel?: string;
}
