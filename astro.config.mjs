import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(root, 'content');

/** Rebuild public/index.json when content/ changes, then reload the browser. */
function contentIndexPlugin() {
  let timer;
  let running = false;
  let queued = false;

  function rebuild(server) {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    const child = spawn(process.execPath, ['scripts/build-index.mjs'], {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, IEXPLO_SKIP_DOI: '1' },
    });
    child.on('exit', () => {
      running = false;
      if (queued) {
        queued = false;
        rebuild(server);
        return;
      }
      server.ws.send({ type: 'full-reload' });
    });
  }

  return {
    name: 'iexplo-content-index',
    configureServer(server) {
      server.watcher.add(contentDir);
      server.watcher.on('all', (_event, file) => {
        const abs = path.resolve(file);
        if (abs !== contentDir && !abs.startsWith(contentDir + path.sep)) return;
        clearTimeout(timer);
        timer = setTimeout(() => rebuild(server), 250);
      });
    },
  };
}

export default defineConfig({
  site: 'https://samthiele.github.io',
  base: '/iexplo',
  integrations: [react()],
  trailingSlash: 'always',
  vite: {
    plugins: [contentIndexPlugin()],
    server: {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  },
});

