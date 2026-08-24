/**
 * Browser GitHub client. The PAT is passed per call and never stored.
 * Requests are allowlisted to this repo (plus GET /user for the sign-in check).
 */
const OWNER = 'samthiele';
const REPO = 'iexplo';
const BRANCH = 'main';
const API = 'https://api.github.com';
const REPO_URL = `${API}/repos/${OWNER}/${REPO}`;
const USER_URL = `${API}/user`;

export const GITHUB_REPO = `${OWNER}/${REPO}`;
export const GITHUB_BRANCH = BRANCH;

export type GitFile = {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
};

export type GitHubUser = {
  login: string;
  canPush: boolean;
};

function assertAllowed(url: string) {
  if (url === USER_URL || url === REPO_URL || url.startsWith(`${REPO_URL}/`)) return;
  throw new Error('Blocked GitHub API URL');
}

async function gh<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  assertAllowed(url);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-GitHub-Api-Version', '2022-11-28');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: string }).message)
        : `GitHub API ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function verifyToken(token: string): Promise<GitHubUser> {
  const trimmed = token.trim();
  if (!trimmed) throw new Error('Paste a GitHub token to continue.');

  let login = 'authenticated';
  try {
    const user = await gh<{ login?: string }>(trimmed, USER_URL);
    if (user?.login) login = user.login;
  } catch {
    // Fine-grained tokens may omit profile access; the repo check is what matters.
  }

  const repo = await gh<{ permissions?: { push?: boolean; admin?: boolean } }>(trimmed, REPO_URL);
  const canPush = Boolean(repo.permissions?.push || repo.permissions?.admin);
  if (!canPush) {
    throw new Error(
      `Token is valid but cannot push to ${GITHUB_REPO}. Use a fine-grained token with Contents: Read and write on this repository only.`,
    );
  }
  return { login, canPush };
}

export function isClassicToken(token: string): boolean {
  return token.trim().startsWith('ghp_');
}

async function getHead(token: string): Promise<{ commitSha: string; treeSha: string }> {
  const ref = await gh<{ object: { sha: string } }>(token, `${REPO_URL}/git/ref/heads/${BRANCH}`);
  const commit = await gh<{ sha: string; tree: { sha: string } }>(
    token,
    `${REPO_URL}/git/commits/${ref.object.sha}`,
  );
  return { commitSha: commit.sha, treeSha: commit.tree.sha };
}

async function createBlob(token: string, file: GitFile): Promise<string> {
  const blob = await gh<{ sha: string }>(token, `${REPO_URL}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: file.content, encoding: file.encoding }),
  });
  return blob.sha;
}

export async function readRepoFile(token: string, path: string): Promise<string | null> {
  try {
    const file = await gh<{ content?: string; encoding?: string }>(
      token,
      `${REPO_URL}/contents/${path}?ref=${BRANCH}`,
    );
    if (!file.content) return null;
    const raw = file.content.replace(/\n/g, '');
    if (file.encoding === 'base64') {
      return decodeBase64(raw);
    }
    return raw;
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Not Found') || message.includes('404')) return null;
    throw err;
  }
}

export async function commitFiles(
  token: string,
  files: GitFile[],
  message: string,
): Promise<{ sha: string; url: string }> {
  if (!files.length) throw new Error('Nothing to commit.');

  const attempt = async () => {
    const head = await getHead(token);
    const treeItems = await Promise.all(
      files.map(async (file) => ({
        path: file.path.replace(/^\//, ''),
        mode: '100644' as const,
        type: 'blob' as const,
        sha: await createBlob(token, file),
      })),
    );
    const tree = await gh<{ sha: string }>(token, `${REPO_URL}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: head.treeSha, tree: treeItems }),
    });
    const commit = await gh<{ sha: string; html_url?: string }>(token, `${REPO_URL}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [head.commitSha],
      }),
    });
    await gh(token, `${REPO_URL}/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    return {
      sha: commit.sha,
      url: commit.html_url || `https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`,
    };
  };

  try {
    return await attempt();
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (/fast forward|does not match|Update is not a fast|conflict/i.test(message)) {
      return attempt();
    }
    throw err;
  }
}

function decodeBase64(raw: string): string {
  const binary = atob(raw);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
