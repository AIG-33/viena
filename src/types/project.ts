export interface Project {
  id: string;
  title: string;
  client: string;
  year: number;
  description: string;
  images: string[];
  categories: string[];
  tags: string[];
  href?: string;
}
