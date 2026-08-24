import { useMemo, useState } from 'react';
import { readImageFile, asImageUrl, parseTagList, parseUrlList, slugify, todayISO } from '../../lib/admin/files';
import { geminiJson, blogDraftPrompt } from '../../lib/admin/gemini';
import { commitFiles, type GitFile } from '../../lib/admin/github';
import { Field, ImageField, Status, SubmitRow, onForm } from './fields';

type Props = {
  token: string;
  geminiKey: string;
  styleExcerpts: string[];
};

export default function BlogForm({ token, geminiKey, styleExcerpts }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [slugPart, setSlugPart] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tags, setTags] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [authors, setAuthors] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [extras, setExtras] = useState<File[]>([]);
  const [extraUrls, setExtraUrls] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const slug = useMemo(() => {
    const part = slugTouched ? slugPart : slugify(title);
    return [date, part].filter(Boolean).join('-');
  }, [date, slugPart, slugTouched, title]);

  async function draft() {
    setError('');
    setOk('');
    setDrafting(true);
    try {
      const result = await geminiJson<{ excerpt: string; body: string }>(
        geminiKey,
        blogDraftPrompt({ title, notes, styleExcerpts }),
      );
      if (result.excerpt) setExcerpt(result.excerpt);
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
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!slugPart && !slugify(title)) {
      setError('Could not build a slug from the title.');
      return;
    }
    setBusy(true);
    try {
      const files: GitFile[] = [];
      let coverName = '';
      if (cover) {
        const image = await readImageFile(cover, 'cover');
        coverName = image.name;
        files.push({
          path: `content/posts/${slug}/${image.name}`,
          content: image.content,
          encoding: 'base64',
        });
      } else if (asImageUrl(coverUrl)) {
        coverName = asImageUrl(coverUrl);
      }
      let markdown = body.trim();
      for (const file of extras) {
        const image = await readImageFile(file);
        files.push({
          path: `content/posts/${slug}/${image.name}`,
          content: image.content,
          encoding: 'base64',
        });
        const tag = `![${file.name.replace(/\.[^.]+$/, '')}](${image.name})`;
        if (!markdown.includes(image.name)) markdown = `${markdown}\n\n${tag}`.trim();
      }
      for (const url of parseUrlList(extraUrls)) {
        if (!markdown.includes(url)) markdown = `${markdown}\n\n![](${url})`.trim();
      }
      const meta: Record<string, unknown> = {
        title: title.trim(),
        date,
        tags: parseTagList(tags),
        excerpt: excerpt.trim(),
      };
      const authorList = authors.split(/[,;\n]/).map((a) => a.trim()).filter(Boolean);
      if (authorList.length) meta.authors = authorList;
      if (coverName) meta.image = coverName;
      files.push(
        {
          path: `content/posts/${slug}/post.json`,
          content: `${JSON.stringify(meta, null, 2)}\n`,
          encoding: 'utf-8',
        },
        {
          path: `content/posts/${slug}/index.md`,
          content: `${markdown}\n`,
          encoding: 'utf-8',
        },
      );
      const result = await commitFiles(token, files, `content: add post ${slug}`);
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
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Slug" hint={`Folder: content/posts/${slug || '…'}/`}>
          <input
            value={slugTouched ? slugPart : slugify(title)}
            onChange={(e) => {
              setSlugTouched(true);
              setSlugPart(slugify(e.target.value));
            }}
          />
        </Field>
      </div>
      <Field label="Tags" hint="Comma-separated, e.g. software, uav">
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </Field>
      <Field label="Authors" hint="Optional, comma-separated">
        <input value={authors} onChange={(e) => setAuthors(e.target.value)} />
      </Field>
      <Field label="Notes for Gemini" hint="Optional bullets or a rough outline">
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div className="admin-actions">
        <button className="admin-btn secondary" type="button" onClick={draft} disabled={drafting || !geminiKey}>
          {drafting ? 'Drafting…' : 'Draft with Gemini'}
        </button>
        {!geminiKey ? <span className="admin-hint">Add a Gemini key above to enable drafting.</span> : null}
      </div>
      <Field label="Excerpt">
        <textarea rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </Field>
      <Field label="Body (markdown)">
        <textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <ImageField label="Cover image" file={cover} url={coverUrl} onFile={setCover} onUrl={setCoverUrl} />
      <Field label="Additional images" hint="Inserted as markdown image tags in the body">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setExtras(Array.from(e.target.files || []))}
        />
      </Field>
      <Field label="Additional image URLs" hint="One direct HTTPS image URL per line">
        <textarea
          rows={3}
          value={extraUrls}
          onChange={(e) => setExtraUrls(e.target.value)}
          placeholder="https://…"
        />
      </Field>
      {error ? <Status kind="err">{error}</Status> : null}
      {ok ? <Status kind="ok">{ok}</Status> : null}
      <SubmitRow busy={busy} label="Push blog post" />
    </form>
  );
}
