export type ArticleStatus = 'draft' | 'published';

export type ArticleSource = {
  label: string;
  url?: string;
  note?: string;
};

export type Article = {
  id?: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  status: ArticleStatus;
  section: string;
  coverImage?: string;
  coverAlt?: string;
  supportingImages: string[];
  sources: ArticleSource[];
  featured?: boolean;
};

export type ArticleInput = Omit<Article, 'id' | 'updatedAt'>;
