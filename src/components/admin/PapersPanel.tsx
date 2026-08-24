import { useState } from 'react';
import { preferExistingTags, readImageFile } from '../../lib/admin/files';
import { geminiJson, paperSummaryPrompt } from '../../lib/admin/gemini';
import { commitFiles, readRepoFile, type GitFile } from '../../lib/admin/github';
import {
  IGNORE_PATH,
  ORCID_ID,
  asPaperImageUrl,
  existingKeysFromIndex,
  firstSentence,
  loadOrcidPapers,
  normalizeDoi,
  normalizeTitle,
  paperFiles,
  paperKey,
  parseIgnoreFile,
  type PaperDraft,
} from '../../lib/admin/papers';
import { Status, ImageField } from './fields';

type Props = {
  token: string;
  geminiKey: string;
  indexUrl: string;
  existingTags: string[];
};

export default function PapersPanel({ token, geminiKey, indexUrl, existingTags }: Props) {
  const [papers, setPapers] = useState<PaperDraft[]>([]);
  const [ignored, setIgnored] = useState<{ dois: string[]; titles: string[] }>({ dois: [], titles: [] });
  const [pendingIgnore, setPendingIgnore] = useState<{ doi: string; title: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [workingDoi, setWorkingDoi] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [covers, setCovers] = useState<Record<string, File>>({});

  async function load() {
    setError('');
    setOk('');
    setBusy(true);
    try {
      const [indexRes, ignoreRaw] = await Promise.all([
        fetch(indexUrl, { cache: 'no-store' }),
        readRepoFile(token, IGNORE_PATH),
      ]);
      const index = indexRes.ok ? await indexRes.json() : {};
      const ignoreFile = parseIgnoreFile(ignoreRaw);
      setIgnored(ignoreFile);
      const existing = existingKeysFromIndex(index);
      const skipDois = new Set([
        ...ignoreFile.dois,
        ...existing.dois,
        ...pendingIgnore.map((item) => item.doi).filter(Boolean),
      ]);
      const skipTitles = new Set([
        ...ignoreFile.titles,
        ...existing.titles,
        ...pendingIgnore.map((item) => normalizeTitle(item.title)).filter(Boolean),
      ]);
      const incoming = await loadOrcidPapers();
      const fresh = incoming.filter((paper) => {
        if (paper.doi && skipDois.has(paper.doi)) return false;
        if (paper.title && skipTitles.has(normalizeTitle(paper.title))) return false;
        return true;
      });
      setPapers(fresh);
      setLoaded(true);
      setOk(
        fresh.length
          ? `Found ${fresh.length} new paper${fresh.length === 1 ? '' : 's'} for ORCID ${ORCID_ID} (${incoming.length} after de-duplicating; already on the site are hidden).`
          : `No new papers for ORCID ${ORCID_ID}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load papers.');
    } finally {
      setBusy(false);
    }
  }

  function update(target: PaperDraft, patch: Partial<PaperDraft>) {
    const key = paperKey(target);
    setPapers((current) => current.map((paper) => (paperKey(paper) === key ? { ...paper, ...patch } : paper)));
  }

  function remove(paper: PaperDraft) {
    setPapers((current) => current.filter((item) => item !== paper && item.doi !== paper.doi));
    setPendingIgnore((current) => [...current, { doi: paper.doi, title: paper.title }]);
  }

  async function summarise(paper: PaperDraft) {
    setError('');
    setWorkingDoi(paperKey(paper));
    try {
      const result = await geminiJson<{ excerpt?: string; body?: string; tags?: unknown; image?: unknown }>(
        geminiKey,
        paperSummaryPrompt({ ...paper, existingTags }),
      );
      const body = (result.body || '').trim();
      const excerpt = (result.excerpt || firstSentence(body)).replace(/[.…]+$/u, '').trim();
      const suggested = asPaperImageUrl(result.image);
      update(paper, {
        excerpt,
        body: body || paper.body,
        tags: preferExistingTags(result.tags, existingTags).join(', '),
        ...(covers[paperKey(paper)] || !suggested ? {} : { imageUrl: suggested }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summarise failed.');
    } finally {
      setWorkingDoi('');
    }
  }

  async function push() {
    setError('');
    setOk('');
    const selected = papers.filter((paper) => paper.selected);
    if (!selected.length && !pendingIgnore.length) {
      setError('Nothing to push. Select papers or remove some to ignore.');
      return;
    }
    setPushing(true);
    try {
      const files: GitFile[] = [];
      for (const paper of selected) {
        const file = covers[paperKey(paper)];
        const cover = file ? await readImageFile(file, 'cover') : undefined;
        files.push(...paperFiles(paper, cover));
      }
      if (pendingIgnore.length) {
        const dois = [...new Set([...ignored.dois, ...pendingIgnore.map((item) => normalizeDoi(item.doi)).filter(Boolean)])].sort();
        const titles = [
          ...new Set([
            ...ignored.titles,
            ...pendingIgnore.map((item) => normalizeTitle(item.title)).filter(Boolean),
          ]),
        ].sort();
        files.push({
          path: IGNORE_PATH,
          content: `${JSON.stringify({ dois, titles }, null, 2)}\n`,
          encoding: 'utf-8',
        });
      }
      const message = selected.length
        ? `content: add papers from ORCID (${selected.length})`
        : 'content: update ignored papers';
      const result = await commitFiles(token, files, message);
      const published = new Set(selected.map((paper) => paper.doi));
      setPapers((current) => current.filter((paper) => !published.has(paper.doi)));
      setCovers((current) => {
        const next = { ...current };
        for (const paper of selected) delete next[paperKey(paper)];
        return next;
      });
      if (pendingIgnore.length) {
        setIgnored((current) => ({
          dois: [...new Set([...current.dois, ...pendingIgnore.map((item) => item.doi)])],
          titles: [...new Set([...current.titles, ...pendingIgnore.map((item) => normalizeTitle(item.title))])],
        }));
        setPendingIgnore([]);
      }
      setOk(`Committed ${result.sha.slice(0, 7)}. The site rebuild will start on GitHub Actions.`);
      window.open(result.url, '_blank', 'noopener');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commit failed.');
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="admin-form">
      <p className="admin-lede">
        Load works for ORCID{' '}
        <a href={`https://orcid.org/${ORCID_ID}`} rel="noreferrer">
          {ORCID_ID}
        </a>
        . Already published titles/DOIs and entries in <code>content/papers/ignore.json</code> are skipped.
        Remove a card to ignore it next time. Uncheck to skip this push without ignoring.
      </p>
      <div className="admin-actions">
        <button className="admin-btn" type="button" onClick={load} disabled={busy}>
          {busy ? 'Loading…' : 'Load new papers from ORCID'}
        </button>
        <button
          className="admin-btn secondary"
          type="button"
          onClick={push}
          disabled={pushing || (!papers.some((p) => p.selected) && !pendingIgnore.length)}
        >
          {pushing ? 'Pushing…' : 'Push to GitHub'}
        </button>
      </div>
      {pendingIgnore.length ? (
        <p className="admin-hint">
          {pendingIgnore.length} paper{pendingIgnore.length === 1 ? '' : 's'} queued for{' '}
          <code>ignore.json</code>.
        </p>
      ) : null}
      {error ? <Status kind="err">{error}</Status> : null}
      {ok ? <Status kind="ok">{ok}</Status> : null}

      {loaded && !papers.length ? <p className="admin-hint">The list is empty.</p> : null}

      {papers.map((paper) => (
        <article className="admin-paper" key={paper.doi || normalizeTitle(paper.title)}>
          <header className="admin-paper-head">
            <label className="admin-check">
              <input
                type="checkbox"
                checked={paper.selected}
                onChange={(e) => update(paper, { selected: e.target.checked })}
              />
              Include
            </label>
            <button className="admin-btn danger" type="button" onClick={() => remove(paper)}>
              Remove / ignore
            </button>
          </header>
          <h3>{paper.title || paper.doi}</h3>
          {paper.authors.length ? <p className="meta">{paper.authors.join(', ')}</p> : null}
          <p className="meta">
            {paper.journal ? <em>{paper.journal}</em> : null}
            {paper.year ? ` · ${paper.year}` : null}
            {' · '}
            <a href={`https://doi.org/${paper.doi}`} rel="noreferrer">
              {paper.doi}
            </a>
          </p>
          <label className="admin-field">
            <span className="admin-label">Card teaser</span>
            <textarea
              rows={2}
              value={paper.excerpt}
              onChange={(e) => update(paper, { excerpt: e.target.value })}
            />
          </label>
          <label className="admin-field">
            <span className="admin-label">Summary (1–3 paragraphs)</span>
            <textarea
              rows={8}
              value={paper.body}
              onChange={(e) => update(paper, { body: e.target.value })}
            />
          </label>
          <label className="admin-field">
            <span className="admin-label">Tags</span>
            <input value={paper.tags} onChange={(e) => update(paper, { tags: e.target.value })} />
          </label>
          <ImageField
            label="Cover image"
            hint="Upload a file, or paste a direct image URL. Summarise with Gemini may suggest an open-access figure."
            file={covers[paperKey(paper)] || null}
            url={paper.imageUrl}
            onFile={(file) => {
              const key = paperKey(paper);
              setCovers((current) => {
                const next = { ...current };
                if (file) next[key] = file;
                else delete next[key];
                return next;
              });
            }}
            onUrl={(url) => update(paper, { imageUrl: url })}
          />
          <div className="admin-actions">
            <button
              className="admin-btn secondary"
              type="button"
              onClick={() => summarise(paper)}
              disabled={!geminiKey || workingDoi === paperKey(paper)}
            >
              {workingDoi === paperKey(paper) ? 'Working…' : 'Summarise with Gemini'}
            </button>
            {!geminiKey ? <span className="admin-hint">Add a Gemini key to enable this.</span> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
