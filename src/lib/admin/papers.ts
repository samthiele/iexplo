export const ORCID_ID = '0000-0002-4383-473X';
const MAILTO = 'iexplo@hzdr.de';
const IGNORE_PATH = 'content/papers/ignore.json';

export { IGNORE_PATH };

const SKIP_TYPES = new Set([
  'dataset',
  'software',
  'lecture-speech',
  'conference-abstract',
  'peer-review',
]);

export type PaperDraft = {
  doi: string;
  title: string;
  authors: string[];
  journal: string;
  year: number | null;
  date: string;
  abstract: string;
  excerpt: string;
  body: string;
  tags: string;
  selected: boolean;
  imageUrl: string;
  oaPdfUrl: string;
  oaLandingUrl: string;
};

export type IgnoreFile = { dois: string[]; titles: string[] };

export function normalizeDoi(doi: string): string {
  return String(doi || '')
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .toLowerCase();
}

export function normalizeTitle(title: string): string {
  return String(title || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseIgnoreFile(raw: string | null): IgnoreFile {
  if (!raw) return { dois: [], titles: [] };
  try {
    const data = JSON.parse(raw) as { dois?: unknown; titles?: unknown };
    const dois = Array.isArray(data.dois)
      ? data.dois.map((d) => normalizeDoi(String(d))).filter(Boolean)
      : [];
    const titles = Array.isArray(data.titles)
      ? data.titles.map((t) => normalizeTitle(String(t))).filter(Boolean)
      : [];
    return { dois: [...new Set(dois)], titles: [...new Set(titles)] };
  } catch {
    return { dois: [], titles: [] };
  }
}

export function existingKeysFromIndex(index: unknown): { dois: Set<string>; titles: Set<string> } {
  const dois = new Set<string>();
  const titles = new Set<string>();
  const posts = (index as { posts?: unknown[] } | null)?.posts;
  if (!Array.isArray(posts)) return { dois, titles };
  for (const post of posts) {
    if (!post || typeof post !== 'object') continue;
    const row = post as { doi?: string; title?: string; paper?: { doi?: string; title?: string } };
    if (row.doi) dois.add(normalizeDoi(row.doi));
    if (row.paper?.doi) dois.add(normalizeDoi(row.paper.doi));
    if (row.title) titles.add(normalizeTitle(row.title));
    if (row.paper?.title) titles.add(normalizeTitle(row.paper.title));
  }
  return { dois, titles };
}

function reconstructAbstract(inverted: Record<string, number[]> | undefined): string {
  if (!inverted) return '';
  const words: string[] = [];
  for (const [word, positions] of Object.entries(inverted)) {
    for (const pos of positions) words[pos] = word;
  }
  return words.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function dateFromParts(value?: string | null, year?: number | null): string {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  if (value && /^\d{4}-\d{2}/.test(value)) return `${value.slice(0, 7)}-01`;
  if (year) return `${year}-01-01`;
  return '';
}

function toDraft(partial: Omit<PaperDraft, 'excerpt' | 'body' | 'tags' | 'selected'>): PaperDraft {
  const abstract = (partial.abstract || '').replace(/\s+/g, ' ').replace(/[.…]+$/u, '').trim();
  const link = `https://doi.org/${partial.doi}`;
  const body = abstract
    ? `${abstract}\n\nFull paper: [${partial.doi}](${link})`
    : `Full paper: [${partial.doi}](${link})`;
  return {
    ...partial,
    excerpt: firstSentence(abstract),
    body,
    tags: 'paper',
    selected: true,
    imageUrl: partial.imageUrl || '',
    oaPdfUrl: partial.oaPdfUrl || '',
    oaLandingUrl: partial.oaLandingUrl || '',
  };
}

export function paperKey(paper: Pick<PaperDraft, 'doi' | 'title'>): string {
  return paper.doi || normalizeTitle(paper.title);
}

/** Keep only a direct HTTPS image URL. Reject PDFs and article landing pages. */
export function asPaperImageUrl(value: unknown): string {
  const url = String(value || '').trim();
  if (!/^https:\/\//i.test(url)) return '';
  if (/\.pdf(\?|$)/i.test(url) || /\/pdf(\?|$)/i.test(url)) return '';
  if (/doi\.org\//i.test(url)) return '';
  return url;
}

/** First complete sentence. Empty if the source has no terminal punctuation (do not add …). */
export function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').replace(/[.…]+$/u, '').trim();
  if (!clean) return '';
  const match = clean.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0].trim() : '';
}

function isEguDoi(doi: string): boolean {
  return normalizeDoi(doi).includes('egusphere-egu');
}

function paperYear(year: number | null | undefined, date?: string): number | null {
  if (year && year > 1000) return year;
  const fromDate = Number((date || '').slice(0, 4));
  return fromDate > 1000 ? fromDate : null;
}

function isFrom2025Onward(year: number | null | undefined, date?: string): boolean {
  const y = paperYear(year, date);
  return y === null || y >= 2025;
}

function isPaperType(type: string | undefined): boolean {
  const t = (type || '').toLowerCase();
  if (!t) return true;
  return !SKIP_TYPES.has(t);
}

function doiRank(doi: string): number {
  const d = doi.toLowerCase();
  if (d.startsWith('10.5281/zenodo')) return 10;
  if (d.includes('arxiv') || d.startsWith('10.48550')) return 20;
  if (d.startsWith('10.31223')) return 25;
  if (d.startsWith('10.5194/egusphere')) return 30;
  if (d.startsWith('10.5194/')) return 80;
  if (/^10\.(1016|1038|1109|1111|3390|3389|1029|1130|1039|1093)/.test(d)) return 90;
  return 50;
}

function pickBestDoi(dois: string[]): string {
  const unique = [...new Set(dois.map(normalizeDoi).filter((doi) => doi && !isEguDoi(doi)))];
  unique.sort((a, b) => doiRank(b) - doiRank(a) || a.localeCompare(b));
  return unique[0] || '';
}

type OpenAlexLocation = {
  landing_page_url?: string | null;
  pdf_url?: string | null;
  source?: { display_name?: string } | null;
};

type OpenAlexWork = {
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  type?: string | null;
  publication_date?: string | null;
  publication_year?: number | null;
  authorships?: { author?: { display_name?: string } }[];
  primary_location?: OpenAlexLocation | null;
  best_oa_location?: OpenAlexLocation | null;
  open_access?: { oa_url?: string | null } | null;
  abstract_inverted_index?: Record<string, number[]>;
};

function openAlexToPartial(work: OpenAlexWork): Omit<PaperDraft, 'excerpt' | 'body' | 'tags' | 'selected'> {
  const oa = work.best_oa_location || work.primary_location;
  return {
    doi: normalizeDoi(work.doi || ''),
    title: (work.display_name || work.title || '').trim(),
    authors: (work.authorships || []).map((a) => a.author?.display_name || '').filter(Boolean),
    journal: work.primary_location?.source?.display_name || oa?.source?.display_name || '',
    year: work.publication_year ?? null,
    date: dateFromParts(work.publication_date, work.publication_year),
    abstract: reconstructAbstract(work.abstract_inverted_index),
    imageUrl: '',
    oaPdfUrl: oa?.pdf_url || work.open_access?.oa_url || '',
    oaLandingUrl: oa?.landing_page_url || '',
  };
}

async function fetchOpenAlexByOrcid(): Promise<OpenAlexWork[]> {
  const works: OpenAlexWork[] = [];
  let cursor: string | null = '*';
  for (let page = 0; page < 10 && cursor; page += 1) {
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.set('filter', `authorships.author.orcid:${ORCID_ID}`);
    url.searchParams.set('per-page', '200');
    url.searchParams.set('cursor', cursor);
    url.searchParams.set('mailto', MAILTO);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenAlex works lookup failed (${res.status})`);
    const data = (await res.json()) as {
      results?: OpenAlexWork[];
      meta?: { next_cursor?: string | null };
    };
    works.push(...(data.results || []));
    cursor = data.meta?.next_cursor || null;
  }
  return works;
}

type OrcidGroup = {
  title: string;
  type: string;
  dois: string[];
  year: number | null;
  date: string;
};

async function fetchOrcidGroups(): Promise<OrcidGroup[]> {
  const res = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`ORCID works lookup failed (${res.status})`);
  const data = (await res.json()) as {
    group?: {
      'work-summary'?: {
        type?: string;
        title?: { title?: { value?: string } };
        'publication-date'?: { year?: { value?: string }; month?: { value?: string }; day?: { value?: string } };
        'external-ids'?: { 'external-id'?: { 'external-id-type'?: string; 'external-id-value'?: string }[] };
      }[];
    }[];
  };
  const groups: OrcidGroup[] = [];
  for (const group of data.group || []) {
    const summaries = group['work-summary'] || [];
    const dois: string[] = [];
    let title = '';
    let type = '';
    let year: number | null = null;
    let date = '';
    for (const summary of summaries) {
      title = summary.title?.title?.value || title;
      type = summary.type || type;
      const y = Number(summary['publication-date']?.year?.value);
      if (y) {
        year = y;
        const m = String(summary['publication-date']?.month?.value || 1).padStart(2, '0');
        const d = String(summary['publication-date']?.day?.value || 1).padStart(2, '0');
        date = `${y}-${m}-${d}`;
      }
      for (const id of summary['external-ids']?.['external-id'] || []) {
        if ((id['external-id-type'] || '').toLowerCase() === 'doi' && id['external-id-value']) {
          dois.push(normalizeDoi(id['external-id-value']));
        }
      }
    }
    if (!title && !dois.length) continue;
    groups.push({ title, type, dois: [...new Set(dois)], year, date });
  }
  return groups;
}

function enrich(partial: Omit<PaperDraft, 'excerpt' | 'body' | 'tags' | 'selected'>, work?: OpenAlexWork): PaperDraft {
  if (!work) return toDraft(partial);
  const extra = openAlexToPartial(work);
  return toDraft({
    doi: pickBestDoi([partial.doi, extra.doi].filter(Boolean)) || extra.doi || partial.doi,
    title: extra.title || partial.title,
    authors: extra.authors.length ? extra.authors : partial.authors,
    journal: extra.journal || partial.journal,
    year: extra.year || partial.year,
    date: extra.date || partial.date,
    abstract: extra.abstract || partial.abstract,
    imageUrl: extra.imageUrl || partial.imageUrl || '',
    oaPdfUrl: extra.oaPdfUrl || partial.oaPdfUrl || '',
    oaLandingUrl: extra.oaLandingUrl || partial.oaLandingUrl || '',
  });
}

export async function loadOrcidPapers(): Promise<PaperDraft[]> {
  const openAlex = await fetchOpenAlexByOrcid().catch(() => [] as OpenAlexWork[]);
  const oaPapers = openAlex
    .filter(
      (work) =>
        isPaperType(work.type || '') &&
        !isEguDoi(work.doi || '') &&
        isFrom2025Onward(work.publication_year, work.publication_date || ''),
    )
    .map(openAlexToPartial)
    .map((p) => toDraft(p));

  let orcidGroups: OrcidGroup[] = [];
  try {
    orcidGroups = await fetchOrcidGroups();
  } catch {
    orcidGroups = [];
  }

  const byDoi = new Map<string, OpenAlexWork>();
  const byTitle = new Map<string, OpenAlexWork>();
  for (const work of openAlex) {
    const doi = normalizeDoi(work.doi || '');
    const title = normalizeTitle(work.display_name || work.title || '');
    if (doi) byDoi.set(doi, work);
    if (title && !byTitle.has(title)) byTitle.set(title, work);
  }

  const fromOrcid: PaperDraft[] = [];
  for (const group of orcidGroups) {
    if (!isPaperType(group.type)) continue;
    if (!isFrom2025Onward(group.year, group.date)) continue;
    const doi = pickBestDoi(group.dois);
    if (!doi && group.dois.some(isEguDoi)) continue;
    const work = (doi && byDoi.get(doi)) || group.dois.map((d) => byDoi.get(d)).find(Boolean) || byTitle.get(normalizeTitle(group.title));
    fromOrcid.push(
      enrich(
        {
          doi,
          title: group.title,
          authors: [],
          journal: '',
          year: group.year,
          date: group.date,
          abstract: '',
          imageUrl: '',
          oaPdfUrl: '',
          oaLandingUrl: '',
        },
        work,
      ),
    );
  }

  const merged = fromOrcid.length ? [...fromOrcid, ...oaPapers] : oaPapers;
  return dedupe(
    merged.filter(
      (paper) =>
        (paper.doi || paper.title) &&
        !isEguDoi(paper.doi) &&
        isFrom2025Onward(paper.year, paper.date),
    ),
  );
}

function draftScore(paper: PaperDraft): number {
  let score = 0;
  if (paper.abstract) score += 2;
  if (paper.authors.length) score += 1;
  if (paper.journal) score += 1;
  if (paper.doi) score += doiRank(paper.doi) / 100;
  return score;
}

function dedupe(papers: PaperDraft[]): PaperDraft[] {
  const clusters: PaperDraft[] = [];
  for (const paper of papers) {
    const titleKey = normalizeTitle(paper.title);
    const match = clusters.findIndex(
      (existing) =>
        (paper.doi && existing.doi === paper.doi) ||
        (titleKey && normalizeTitle(existing.title) === titleKey),
    );
    if (match < 0) clusters.push(paper);
    else if (draftScore(paper) > draftScore(clusters[match])) clusters[match] = paper;
  }
  return clusters.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function paperSlug(paper: PaperDraft): string {
  const date = paper.date || todayFallback();
  const slug = slugFromTitle(paper.title) || paper.doi.replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  return `${date}-${slug}`;
}

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function todayFallback(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function paperFiles(
  paper: PaperDraft,
  cover?: { name: string; content: string },
): { path: string; content: string; encoding: 'utf-8' | 'base64' }[] {
  const slug = paperSlug(paper);
  const tags = paper.tags
    .split(/[,#\n]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  if (!tags.includes('paper')) tags.unshift('paper');
  const meta: Record<string, unknown> = {
    title: paper.title,
    date: paper.date || todayFallback(),
    tags,
    excerpt: paper.excerpt,
    doi: paper.doi,
  };
  if (paper.authors.length) meta.authors = paper.authors;
  if (paper.journal) meta.journal = paper.journal;
  if (paper.year) meta.year = paper.year;
  if (cover) meta.image = cover.name;
  else if (paper.imageUrl.trim()) meta.image = paper.imageUrl.trim();
  const files: { path: string; content: string; encoding: 'utf-8' | 'base64' }[] = [
    {
      path: `content/posts/${slug}/post.json`,
      content: `${JSON.stringify(meta, null, 2)}\n`,
      encoding: 'utf-8',
    },
    {
      path: `content/posts/${slug}/index.md`,
      content: `${(paper.body || paper.excerpt).trim()}\n`,
      encoding: 'utf-8',
    },
  ];
  if (cover) {
    files.push({
      path: `content/posts/${slug}/${cover.name}`,
      content: cover.content,
      encoding: 'base64',
    });
  }
  return files;
}
