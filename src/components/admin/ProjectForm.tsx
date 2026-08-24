import { useMemo, useState } from 'react';
import { asImageUrl, readImageFile, slugify, toFrontmatter } from '../../lib/admin/files';
import { geminiJson } from '../../lib/admin/gemini';
import { commitFiles, type GitFile } from '../../lib/admin/github';
import { Field, ImageField, Status, SubmitRow, onForm } from './fields';

type ResearchTopic = { slug: string; title: string };

type Props = {
  token: string;
  geminiKey: string;
  research: ResearchTopic[];
};

export default function ProjectForm({ token, geminiKey, research }: Props) {
  const [title, setTitle] = useState('');
  const [slugPart, setSlugPart] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [years, setYears] = useState('');
  const [funding, setFunding] = useState('');
  const [partners, setPartners] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const slug = useMemo(
    () => (slugTouched ? slugPart : slugify(title)),
    [slugPart, slugTouched, title],
  );

  function toggleTopic(id: string) {
    setTopics((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function draft() {
    setError('');
    setDrafting(true);
    try {
      const result = await geminiJson<{ body: string }>(
        geminiKey,
        `Write a short project description (two or three sentences plus optional bullet partners/software) in British English for the iExplo / HZDR-HIF website. Direct, no hype.
Title: ${title || '(untitled)'}
Years: ${years || '(unspecified)'}
Funding: ${funding || '(unspecified)'}
Partners: ${partners || '(none)'}
Research topics: ${topics.join(', ') || '(none)'}
Existing notes: ${body || '(none)'}
Return JSON with key body (markdown).`,
      );
      if (result.body) setBody(result.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft failed.');
    } finally {
      setDrafting(false);
    }
  }

  async function submit() {
    setError('');
    setOk('');
    if (!title.trim() || !slug) {
      setError('Title and slug are required.');
      return;
    }
    setBusy(true);
    try {
      const files: GitFile[] = [];
      let imageName = '';
      if (image) {
        const uploaded = await readImageFile(image, 'cover');
        imageName = uploaded.name;
        files.push({
          path: `content/projects/${slug}/${uploaded.name}`,
          content: uploaded.content,
          encoding: 'base64',
        });
      } else if (asImageUrl(imageUrl)) {
        imageName = asImageUrl(imageUrl);
      }
      files.push({
        path: `content/projects/${slug}/index.md`,
        content: toFrontmatter(
          {
            title: title.trim(),
            years: years.trim(),
            funding: funding.trim(),
            research: topics,
            partners: partners.split('\n').map((line) => line.trim()).filter(Boolean),
            image: imageName || undefined,
          },
          body.trim(),
        ),
        encoding: 'utf-8',
      });
      const result = await commitFiles(token, files, `content: add project ${slug}`);
      setOk(`Committed ${result.sha.slice(0, 7)}. The site rebuild will start on GitHub Actions.`);
      window.open(result.url, '_blank', 'noopener');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commit failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onForm(submit)}>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <div className="admin-row">
        <Field label="Slug" hint={`Folder: content/projects/${slug || '…'}/`}>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlugPart(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Years">
          <input value={years} onChange={(e) => setYears(e.target.value)} placeholder="2022–2025" />
        </Field>
      </div>
      <Field label="Funding">
        <input value={funding} onChange={(e) => setFunding(e.target.value)} />
      </Field>
      <Field label="Partners" hint="One organisation per line">
        <textarea rows={4} value={partners} onChange={(e) => setPartners(e.target.value)} />
      </Field>
      <fieldset className="admin-fieldset">
        <legend className="admin-label">Research topics</legend>
        <div className="admin-checks">
          {research.map((topic) => (
            <label key={topic.slug} className="admin-check">
              <input
                type="checkbox"
                checked={topics.includes(topic.slug)}
                onChange={() => toggleTopic(topic.slug)}
              />
              {topic.title}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="admin-actions">
        <button className="admin-btn secondary" type="button" onClick={draft} disabled={drafting || !geminiKey}>
          {drafting ? 'Drafting…' : 'Draft with Gemini'}
        </button>
        {!geminiKey ? <span className="admin-hint">Add a Gemini key above to enable drafting.</span> : null}
      </div>
      <Field label="Description (markdown)">
        <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <ImageField label="Cover image" file={image} url={imageUrl} onFile={setImage} onUrl={setImageUrl} />
      {error ? <Status kind="err">{error}</Status> : null}
      {ok ? <Status kind="ok">{ok}</Status> : null}
      <SubmitRow busy={busy} label="Push project" />
    </form>
  );
}
