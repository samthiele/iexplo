import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="admin-field">
      <span className="admin-label">{label}</span>
      {children}
      {hint ? <span className="admin-hint">{hint}</span> : null}
    </label>
  );
}

export function ImageField({
  label,
  hint = 'Upload a file, or paste a direct image URL. Upload wins if both are set.',
  file,
  url,
  onFile,
  onUrl,
}: {
  label: string;
  hint?: string;
  file: File | null;
  url: string;
  onFile: (file: File | null) => void;
  onUrl: (url: string) => void;
}) {
  return (
    <div className="admin-field">
      <span className="admin-label">{label}</span>
      <input
        type="url"
        placeholder="https://… (direct image URL)"
        value={url}
        onChange={(e) => onUrl(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} />
      {hint ? <span className="admin-hint">{hint}</span> : null}
      <CoverPreview file={file || undefined} url={url} />
    </div>
  );
}

export function CoverPreview({ file, url }: { file?: File; url: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (file) {
      const next = URL.createObjectURL(file);
      setSrc(next);
      return () => URL.revokeObjectURL(next);
    }
    setSrc(url.trim());
  }, [file, url]);
  if (!src) return null;
  return (
    <img
      className="admin-cover-preview"
      src={src}
      alt=""
      onError={() => {
        if (!file) setSrc('');
      }}
    />
  );
}

export function Status({
  kind,
  children,
}: {
  kind: 'ok' | 'err' | 'info';
  children: ReactNode;
}) {
  return <p className={`admin-status is-${kind}`}>{children}</p>;
}

export function SubmitRow({
  busy,
  label,
  disabled,
}: {
  busy: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="admin-actions">
      <button className="admin-btn" type="submit" disabled={busy || disabled}>
        {busy ? 'Pushing…' : label}
      </button>
    </div>
  );
}

export function onForm(handler: () => Promise<void>) {
  return async (event: FormEvent) => {
    event.preventDefault();
    await handler();
  };
}
