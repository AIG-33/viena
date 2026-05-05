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
}
