import { useEffect, useState } from 'react';
import { loadGeminiKey, saveGeminiKey } from '../../lib/admin/gemini';
import { GITHUB_REPO, isClassicToken, verifyToken, type GitHubUser } from '../../lib/admin/github';
import BlogForm from './BlogForm';
import PapersPanel from './PapersPanel';
import PersonForm from './PersonForm';
import ProjectForm from './ProjectForm';

type Tab = 'blog' | 'people' | 'projects' | 'papers';

type Props = {
  indexUrl: string;
  research: { slug: string; title: string }[];
  styleExcerpts: string[];
  existingTags: string[];
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'blog', label: 'Blog' },
  { id: 'people', label: 'People' },
  { id: 'projects', label: 'Projects' },
  { id: 'papers', label: 'Papers' },
];

export default function AdminApp({ indexUrl, research, styleExcerpts, existingTags }: Props) {
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [tab, setTab] = useState<Tab>('blog');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setGeminiKey(loadGeminiKey());
  }, []);

  function persistGemini(value: string) {
    setGeminiKey(value);
    saveGeminiKey(value.trim());
  }

  async function signIn() {
    setError('');
    setBusy(true);
    try {
      const next = tokenInput.trim();
      const profile = await verifyToken(next);
      setToken(next);
      setUser(profile);
      setTokenInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    setToken('');
    setUser(null);
    setTokenInput('');
  }

  if (!token || !user) {
    return (
      <div className="admin-gate">
        <h1 className="page-title">Content editor</h1>
        <p className="lede">
          A GitHub token is required to push content. A Gemini key is optional and only used to draft
          text.
        </p>
        <p className="admin-label">GitHub token</p>
        <ol className="admin-steps">
          <li>
            Open{' '}
            <a href="https://github.com/settings/personal-access-tokens" rel="noreferrer">
              GitHub → Settings → Fine-grained tokens
            </a>{' '}
            and generate a new token (7–90 day expiry).
          </li>
          <li>
            Restrict it to <code>{GITHUB_REPO}</code> with <code>Contents: Read and write</code>.
          </li>
          <li>Paste the token below, then continue.</li>
        </ol>
        <p className="admin-label">Gemini API key</p>
        <ol className="admin-steps">
          <li>
            Open{' '}
            <a href="https://aistudio.google.com/apikey" rel="noreferrer">
              Google AI Studio → API keys
            </a>{' '}
            and create a key.
          </li>
          <li>Paste it below if you want drafting and paper summaries.</li>
        </ol>
        <label className="admin-field">
          <span className="admin-label">GitHub token</span>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void signIn();
              }
            }}
          />
        </label>
        {isClassicToken(tokenInput) ? (
          <p className="admin-status is-err">
            That looks like a classic token. Prefer a fine-grained token locked to {GITHUB_REPO}.
          </p>
        ) : null}
        <label className="admin-field">
          <span className="admin-label">Gemini API key (optional)</span>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={geminiKey}
            onChange={(e) => persistGemini(e.target.value)}
          />
          <span className="admin-hint">Optional. Used only for drafting in this tab.</span>
        </label>
        {error ? <p className="admin-status is-err">{error}</p> : null}
        <div className="admin-actions">
          <button className="admin-btn" type="button" onClick={() => void signIn()} disabled={busy || !tokenInput.trim()}>
            {busy ? 'Checking…' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <div className="admin-toolbar">
        <p className="admin-who">
          Signed in as <strong>{user.login}</strong> · push to <code>{GITHUB_REPO}</code>
        </p>
        <button className="admin-btn secondary" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
      <label className="admin-field admin-gemini">
        <span className="admin-label">Gemini API key</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={geminiKey}
          onChange={(e) => persistGemini(e.target.value)}
          placeholder="Optional — drafts and paper summaries"
        />
      </label>
      <div className="admin-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`admin-tab${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'blog' ? (
        <BlogForm token={token} geminiKey={geminiKey} styleExcerpts={styleExcerpts} />
      ) : null}
      {tab === 'people' ? <PersonForm token={token} geminiKey={geminiKey} /> : null}
      {tab === 'projects' ? (
        <ProjectForm token={token} geminiKey={geminiKey} research={research} />
      ) : null}
      {tab === 'papers' ? (
        <PapersPanel token={token} geminiKey={geminiKey} indexUrl={indexUrl} existingTags={existingTags} />
      ) : null}
    </div>
  );
}
