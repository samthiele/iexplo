#!/usr/bin/env node
/**
 * Walk content/, resolve paper DOIs, copy images, write public/index.json.
 */
import { mkdir, readdir, readFile, writeFile, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(PUBLIC, 'index.json');
const MAILTO = process.env.CROSSREF_MAILTO || 'iexplo@hzdr.de';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

async function listDirs(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

function normalizeDoi(doi) {
  if (!doi) return '';
  return String(doi)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
}

function formatAuthors(authors) {
  if (!Array.isArray(authors)) return [];
  return authors
    .map((a) => {
      if (typeof a === 'string') return a;
      const given = a.given || a.givenNames || '';
      const family = a.family || a.familyName || a.name || '';
      return [given, family].filter(Boolean).join(' ').trim();
    })
    .filter(Boolean);
}

function yearFromDateParts(parts) {
  const value = parts?.['date-parts']?.[0]?.[0];
  return value ? Number(value) : null;
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': `iexplo-index/1.0 (mailto:${MAILTO})`, ...headers },
  });
  if (!res.ok) return null;
  return res.json();
}

async function resolveCrossref(doi) {
  const data = await fetchJson(
    `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${encodeURIComponent(MAILTO)}`,
  );
  const msg = data?.message;
  if (!msg) return null;
  const issued = yearFromDateParts(msg.issued) || yearFromDateParts(msg.published);
  const monthDay = msg.issued?.['date-parts']?.[0];
  const date = monthDay
    ? [monthDay[0], String(monthDay[1] || 1).padStart(2, '0'), String(monthDay[2] || 1).padStart(2, '0')].join('-')
    : issued
      ? `${issued}-01-01`
      : '';
  return {
    title: Array.isArray(msg.title) ? msg.title[0] : msg.title || '',
    authors: formatAuthors(msg.author),
    journal: Array.isArray(msg['container-title']) ? msg['container-title'][0] : msg['container-title'] || '',
    year: issued,
    date,
    doi: msg.DOI || doi,
    url: msg.URL || `https://doi.org/${doi}`,
    type: msg.type || 'journal-article',
    source: 'crossref',
  };
}

async function resolveDatacite(doi) {
  const data = await fetchJson(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`);
  const attr = data?.data?.attributes;
  if (!attr) return null;
  const year = attr.publicationYear || null;
  return {
    title: attr.titles?.[0]?.title || '',
    authors: (attr.creators || []).map((c) => c.name).filter(Boolean),
    journal: attr.container?.title || attr.publisher || '',
    year,
    date: year ? `${year}-01-01` : '',
    doi: attr.doi || doi,
    url: `https://doi.org/${doi}`,
    type: attr.types?.resourceTypeGeneral || 'Dataset',
    source: 'datacite',
  };
}

async function resolveDoi(doi) {
  const id = normalizeDoi(doi);
  if (!id) return null;
  try {
    return (await resolveCrossref(id)) || (await resolveDatacite(id));
  } catch (err) {
    console.warn(`DOI lookup failed for ${id}: ${err.message}`);
    return null;
  }
}

function paperComplete(paper) {
  return Boolean(paper?.title && paper?.authors?.length && (paper.journal || paper.year) && paper.doi);
}

function mergePaper(local, resolved) {
  const paper = {
    title: local.title || resolved?.title || '',
    authors: Array.isArray(local.authors) && local.authors.length ? local.authors : resolved?.authors || [],
    journal: local.journal || resolved?.journal || '',
    year: local.year || resolved?.year || null,
    date: local.date || resolved?.date || '',
    doi: normalizeDoi(local.doi || resolved?.doi),
    url: local.url || resolved?.url || (local.doi ? `https://doi.org/${normalizeDoi(local.doi)}` : ''),
    type: local.type || resolved?.type || '',
    source: resolved?.source || (paperComplete(local) ? 'local' : ''),
  };
  return paper;
}

async function copyImages(srcDir, destDir) {
  const images = [];
  if (!existsSync(srcDir)) return images;
  await mkdir(destDir, { recursive: true });

  async function walk(current, rel = '') {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = path.join(rel, entry.name);
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(abs, relPath);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXT.has(ext)) continue;
      const dest = path.join(destDir, relPath);
      await mkdir(path.dirname(dest), { recursive: true });
      await cp(abs, dest);
      images.push(relPath.split(path.sep).join('/'));
    }
  }

  await walk(srcDir);
  return images;
}

async function loadMarkdown(filePath) {
  if (!existsSync(filePath)) return { data: {}, body: '' };
  const raw = await readFile(filePath, 'utf8');
  const parsed = matter(raw);
  return { data: parsed.data || {}, body: parsed.content.trim() };
}

async function indexCollection(kind) {
  const dir = path.join(CONTENT, kind);
  const slugs = await listDirs(dir);
  const items = [];

  for (const slug of slugs.sort()) {
    const folder = path.join(dir, slug);
    const mdPath = path.join(folder, 'index.md');
    const { data, body } = await loadMarkdown(mdPath);
    const images = await copyImages(folder, path.join(PUBLIC, 'content', kind, slug));
    items.push({
      slug,
      kind,
      title: data.title || slug,
      ...data,
      body,
      images,
      image: data.image || images.find((f) => /(^|\/)(photo|portrait|cover|card)\./i.test(f)) || images[0] || '',
    });
  }
  return items;
}

async function indexPages() {
  const dir = path.join(CONTENT, 'pages');
  if (!existsSync(dir)) return [];
  const images = await copyImages(dir, path.join(PUBLIC, 'content', 'pages', 'home'));
  const files = (await listFiles(dir)).filter((f) => f.endsWith('.md'));
  const items = [];
  for (const file of files) {
    const { data, body } = await loadMarkdown(path.join(dir, file));
    items.push({
      slug: file.replace(/\.md$/, ''),
      kind: 'page',
      title: data.title || file,
      ...data,
      body,
      image: data.image || images[0] || '',
    });
  }
  return items;
}

async function indexPosts() {
  const dir = path.join(CONTENT, 'posts');
  const slugs = await listDirs(dir);
  const items = [];

  for (const slug of slugs.sort()) {
    const folder = path.join(dir, slug);
    const { data, body } = await loadMarkdown(path.join(folder, 'index.md'));
    const jsonPath = path.join(folder, 'post.json');
    let meta = {};
    if (existsSync(jsonPath)) {
      meta = JSON.parse(await readFile(jsonPath, 'utf8'));
    }

    const tags = [...new Set([...(meta.tags || []), ...(data.tags || [])].map((t) => String(t).replace(/^#/, '').toLowerCase()))];
    const isPaper = tags.includes('paper') || Boolean(meta.doi || data.doi);
    const localPaper = {
      title: meta.title || data.title,
      authors: meta.authors || data.authors,
      journal: meta.journal || data.journal,
      year: meta.year || data.year,
      date: meta.date || data.date,
      doi: meta.doi || data.doi,
      url: meta.url || data.url,
    };

    let resolved = null;
    if (isPaper && localPaper.doi && !paperComplete(localPaper) && !process.env.IEXPLO_SKIP_DOI) {
      console.log(`Resolving DOI ${localPaper.doi} (${slug})`);
      resolved = await resolveDoi(localPaper.doi);
    }

    const paper = isPaper ? mergePaper(localPaper, resolved) : null;
    const images = await copyImages(folder, path.join(PUBLIC, 'content', 'posts', slug));

    items.push({
      slug,
      kind: 'post',
      title: meta.title || data.title || paper?.title || slug,
      date: meta.date || data.date || paper?.date || '',
      excerpt: meta.excerpt || data.excerpt || '',
      tags,
      authors: meta.authors || data.authors || paper?.authors || [],
      doi: paper?.doi || normalizeDoi(meta.doi || data.doi),
      paper,
      selected: Boolean(meta.selected || data.selected),
      body,
      images,
      image: meta.image || data.image || images[0] || '',
    });
  }

  items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return items;
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  const [posts, people, research, projects, pages] = await Promise.all([
    indexPosts(),
    indexCollection('people'),
    indexCollection('research'),
    indexCollection('projects'),
    indexPages(),
  ]);

  people.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));
  research.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));
  projects.sort((a, b) => String(b.years || '').localeCompare(String(a.years || '')) || a.title.localeCompare(b.title));

  const tags = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      tags[tag] ??= [];
      tags[tag].push(post.slug);
    }
  }

  const index = {
    generatedAt: new Date().toISOString(),
    posts,
    people,
    research,
    projects,
    pages,
    tags,
  };

  await writeFile(OUT, JSON.stringify(index, null, 2) + '\n');
  console.log(
    `Wrote ${path.relative(ROOT, OUT)} — ${posts.length} posts, ${people.length} people, ${research.length} research, ${projects.length} projects`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
