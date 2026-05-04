export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductOption {
  title: string;
  variants: string[];
}

export interface ProductDataTable {
  title?: string;
  header: string[];
  rows: string[][];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  images: string[];
  specs: ProductSpec[];
  options?: ProductOption[];
  dataTable?: ProductDataTable;
  tags: string[];
  featured: boolean;
  inStock: boolean;
  catalogNumber?: string;
  manufacturer?: string;
  createdAt: string;
}
