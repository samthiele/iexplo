export type UploadedImage = {
  name: string;
  encoding: 'base64';
  content: string;
};

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yamlQuote(value: string): string {
  if (value === '') return '""';
  if (/^[A-Za-z0-9][A-Za-z0-9 .,_/+–—-]*$/.test(value) && !/:$/.test(value)) return value;
  return JSON.stringify(value);
}

export function toFrontmatter(fields: Record<string, unknown>, body: string): string {
  const lines = ['---'];
  for (const [key, raw] of Object.entries(fields)) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (Array.isArray(raw)) {
      if (!raw.length) continue;
      const values = raw.map((item) => String(item).trim()).filter(Boolean);
      if (!values.length) continue;
      if (values.every((item) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(item))) {
        lines.push(`${key}: [${values.join(', ')}]`);
      } else {
        lines.push(`${key}:`);
        for (const item of values) lines.push(`  - ${yamlQuote(item)}`);
      }
      continue;
    }
    if (typeof raw === 'number' || typeof raw === 'boolean') {
      lines.push(`${key}: ${raw}`);
      continue;
    }
    lines.push(`${key}: ${yamlQuote(String(raw))}`);
  }
  lines.push('---', '', body.replace(/^\n+/, '').replace(/\n+$/, ''), '');
  return lines.join('\n');
}

export async function readImageFile(file: File, preferredName?: string): Promise<UploadedImage> {
  const ext = extension(file.name);
  const base = slugify(preferredName || file.name.replace(/\.[^.]+$/, '')) || 'image';
  const content = await fileToBase64(file);
  return { name: `${base}.${ext}`, encoding: 'base64', content };
}

export function parseTagList(value: string): string[] {
  return [...new Set(value.split(/[,#\n]/).map((tag) => slugify(tag)).filter(Boolean))];
}

/** Direct HTTPS image URL. Empty if missing or not https. */
export function asImageUrl(value: string): string {
  const url = value.trim();
  return /^https:\/\//i.test(url) ? url : '';
}

export function parseUrlList(value: string): string[] {
  return [...new Set(value.split(/\n/).map((line) => asImageUrl(line)).filter(Boolean))];
}

/** Keep `paper`, map suggestions onto existing blog tags, allow at most one new slug. */
export function preferExistingTags(suggested: unknown, existing: string[]): string[] {
  const known = new Map(existing.map((tag) => [slugify(tag), tag]));
  const raw = Array.isArray(suggested)
    ? suggested
    : String(suggested || '')
        .split(/[,#\n]/)
        .map((tag) => tag.trim())
        .filter(Boolean);
  const matched: string[] = [];
  const novel: string[] = [];
  const seen = new Set<string>(['paper']);
  for (const item of raw) {
    const slug = slugify(String(item));
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const canonical = known.get(slug);
    if (canonical && canonical !== 'paper') matched.push(canonical);
    else if (slug !== 'paper') novel.push(slug);
  }
  const tags = ['paper', ...matched];
  if (matched.length === 0 && novel[0]) tags.push(novel[0]);
  return tags;
}

function extension(name: string): string {
  const match = name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/);
  return match ? match[1].replace('jpeg', 'jpg') : 'jpg';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}
