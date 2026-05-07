export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  updatedNote: string;
  sections: LegalSection[];
  jurisdictionNote?: string;
};
