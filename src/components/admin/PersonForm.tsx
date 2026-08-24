import { useMemo, useState } from 'react';
import { asImageUrl, readImageFile, slugify, toFrontmatter } from '../../lib/admin/files';
import { geminiJson } from '../../lib/admin/gemini';
import { commitFiles, type GitFile } from '../../lib/admin/github';
import { Field, ImageField, Status, SubmitRow, onForm } from './fields';

type Props = {
  token: string;
  geminiKey: string;
};

export default function PersonForm({ token, geminiKey }: Props) {
  const [title, setTitle] = useState('');
  const [slugPart, setSlugPart] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [role, setRole] = useState('');
  const [order, setOrder] = useState('99');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const slug = useMemo(
    () => (slugTouched ? slugPart : slugify(title)),
    [slugPart, slugTouched, title],
  );

  async function draft() {
    setError('');
    setDrafting(true);
    try {
      const result = await geminiJson<{ bio: string }>(
        geminiKey,
        `Write a first-person or third-person research bio (one short paragraph) in British English for an iExplo / HZDR-HIF team page.
Name: ${title || '(unnamed)'}
Role: ${role || '(unspecified)'}
Existing notes: ${bio || '(none)'}
Return JSON with key bio.`,
      );
      if (result.bio) setBio(result.bio);
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
      setError('Name and slug are required.');
      return;
    }
    setBusy(true);
    try {
      const files: GitFile[] = [];
      let imageName = '';
      if (photo) {
        const image = await readImageFile(photo, 'photo');
        imageName = image.name;
        files.push({
          path: `content/people/${slug}/${image.name}`,
          content: image.content,
          encoding: 'base64',
        });
      } else if (asImageUrl(photoUrl)) {
        imageName = asImageUrl(photoUrl);
      }
      const orderNum = Number(order);
      files.push({
        path: `content/people/${slug}/index.md`,
        content: toFrontmatter(
          {
            title: title.trim(),
            role: role.trim(),
            order: Number.isFinite(orderNum) ? orderNum : 99,
            image: imageName || undefined,
          },
          bio.trim(),
        ),
        encoding: 'utf-8',
      });
      const result = await commitFiles(token, files, `content: add person ${slug}`);
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
      <Field label="Name">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <div className="admin-row">
        <Field label="Slug" hint={`Folder: content/people/${slug || '…'}/`}>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlugPart(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Order" hint="Lower numbers appear first">
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
        </Field>
      </div>
      <Field label="Role">
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Geologist & Data Scientist" />
      </Field>
      <div className="admin-actions">
        <button className="admin-btn secondary" type="button" onClick={draft} disabled={drafting || !geminiKey}>
          {drafting ? 'Drafting…' : 'Draft bio with Gemini'}
        </button>
        {!geminiKey ? <span className="admin-hint">Add a Gemini key above to enable drafting.</span> : null}
      </div>
      <Field label="Bio (markdown)">
        <textarea rows={8} value={bio} onChange={(e) => setBio(e.target.value)} />
      </Field>
      <ImageField label="Photo" file={photo} url={photoUrl} onFile={setPhoto} onUrl={setPhotoUrl} />
      {error ? <Status kind="err">{error}</Status> : null}
      {ok ? <Status kind="ok">{ok}</Status> : null}
      <SubmitRow busy={busy} label="Push person" />
    </form>
  );
}
