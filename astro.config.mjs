import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://samthiele.github.io',
  base: '/iexplo',
  integrations: [react()],
  trailingSlash: 'always',
});
