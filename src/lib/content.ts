import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked } from 'marked';

export type Paper = {
  title: string;
  authors: string[];
  journal: string;
  year: number | null;
  date: string;
  doi: string;
  url: string;
  type: string;
  source: string;
};

export type ContentItem = {
  slug: string;
  kind: string;
  title: string;
  body: string;
  image?: string;
  images?: string[];
  [key: string]: unknown;
};

export type Post = ContentItem & {
  date: string;
  excerpt: string;
  tags: string[];
  authors: string[];
  doi?: string;
  paper: Paper | null;
  selected?: boolean;
};

export type Person = ContentItem & {
  role?: string;
  order?: number;
};

export type Research = ContentItem & {
  subtitle?: string;
  order?: number;
  projects?: string[];
};

export type Project = ContentItem & {
  years?: string;
  funding?: string;
  research?: string[];
  partners?: string[];
};

export type SiteIndex = {
  generatedAt: string;
  posts: Post[];
  people: Person[];
  research: Research[];
  projects: Project[];
  pages: ContentItem[];
  tags: Record<string, string[]>;
};

let cached: SiteIndex | null = null;

export function loadIndex(): SiteIndex {
  if (!import.meta.env.DEV && cached) return cached;
  const file = resolve(process.cwd(), 'public/index.json');
  cached = JSON.parse(readFileSync(file, 'utf8')) as SiteIndex;
  return cached;
}

export function renderMarkdown(md: string, kind?: string, slug?: string): string {
  let html = marked.parse(md, { async: false }) as string;
  if (kind && slug) {
    html = html.replace(/src="(?!https?:|\/|#)([^"]+)"/g, (_m, file) => `src="${assetUrl(kind, slug, file)}"`);
  }
  return html;
}

export function assetUrl(kind: string, slug: string, file: string): string {
  if (!file) return '';
  if (file.startsWith('http')) return file;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const url = `${base}content/${kind}/${slug}/${file}`;
  const stamp = loadIndex().generatedAt?.replace(/\D/g, '') || '';
  return stamp ? `${url}?v=${stamp}` : url;
}

export function page(slug: string): ContentItem | undefined {
  return loadIndex().pages.find((p) => p.slug === slug);
}

export function postsByTag(tag: string): Post[] {
  return loadIndex().posts.filter((p) => p.tags.includes(tag));
}

export function paperPosts(): Post[] {
  return loadIndex().posts.filter((p) => p.tags.includes('paper') || p.paper);
}

export function formatAuthors(authors: string[]): string {
  if (!authors?.length) return '';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors[0]} et al.`;
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
