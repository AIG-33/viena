export interface Manufacturer {
  id: string;
  slug: string;
  name: string;
  fullName?: string;
  country: string;
  tagline?: string;
  shortDescription: string;
  longDescription: string;
  website?: string;
  logo?: string;
  categories: string[];
  matches?: string[];
  featured?: boolean;
  productCount?: number;
}
