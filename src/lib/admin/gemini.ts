import summarySkill from './iexplo-summary.md?raw';

const GEMINI_STORAGE = 'iexplo-gemini-key';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

export const IEXPLO_SUMMARY_SKILL = summarySkill;

export function loadGeminiKey(): string {
  try {
    return sessionStorage.getItem(GEMINI_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveGeminiKey(key: string): void {
  try {
    if (key) sessionStorage.setItem(GEMINI_STORAGE, key);
    else sessionStorage.removeItem(GEMINI_STORAGE);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export async function geminiText(apiKey: string, prompt: string): Promise<string> {
  const key = apiKey.trim();
  if (!key) throw new Error('Add a Gemini API key to draft with the model.');

  const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
    }),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini API ${res.status}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  if (!text.trim()) throw new Error('Gemini returned an empty response.');
  return text.trim();
}

export async function geminiJson<T>(apiKey: string, prompt: string): Promise<T> {
  const text = await geminiText(
    apiKey,
    `${prompt}\n\nReply with JSON only. No markdown fences.`,
  );
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini did not return JSON.');
  return JSON.parse(match[0]) as T;
}

export function paperSummaryPrompt(paper: {
  title: string;
  authors: string[];
  journal: string;
  year: number | null;
  doi: string;
  abstract: string;
  existingTags: string[];
  oaLandingUrl?: string;
  oaPdfUrl?: string;
}): string {
  const tagList = paper.existingTags.length ? paper.existingTags.join(', ') : 'paper';
  return `${IEXPLO_SUMMARY_SKILL}

---

Write an iExplo paper-alert for this work. Return JSON with keys excerpt (one complete sentence), body (1–3 short markdown paragraphs, then a DOI link), tags (array of 1–4 slugs), and image (HTTPS URL string, or ""). Always include "paper" in tags. Prefer tags from this existing list: ${tagList}. Only invent a new lowercase slug if none of those fit. Do not truncate with ellipses.

For image: only a direct open-access figure, graphical abstract, or cover image URL (png/jpg/webp), not a PDF and not the article HTML page. Use a publisher/CDN figure you are confident exists (MDPI article_deploy/html/images, Frontiers, Copernicus, PLOS, PMC article bin). If unsure, return "".

Title: ${paper.title}
Authors: ${paper.authors.join(', ') || '(unknown)'}
Journal: ${paper.journal || '(unknown)'}
Year: ${paper.year || '(unknown)'}
DOI: ${paper.doi}
OA landing page: ${paper.oaLandingUrl || '(none)'}
OA PDF: ${paper.oaPdfUrl || '(none)'}
Abstract: ${paper.abstract || '(none)'}
`;
}

export function blogDraftPrompt(input: {
  title: string;
  notes: string;
  styleExcerpts: string[];
}): string {
  const examples = input.styleExcerpts.slice(0, 4).map((e) => `- ${e}`).join('\n');
  return `${IEXPLO_SUMMARY_SKILL}

---

Write an iExplo blog post. Return JSON with keys excerpt (one complete sentence) and body (1–3 short markdown paragraphs). Do not truncate with ellipses.

Title: ${input.title || '(untitled)'}
Editor notes: ${input.notes || '(none)'}
Existing card-excerpt examples:
${examples || '(none)'}
`;
}
