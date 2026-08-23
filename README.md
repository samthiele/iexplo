# iExplo

Static site for [Innovative Exploration](https://www.iexplo.space/) (HZDR-HIF). Content lives in markdown folders; a Node script compiles `public/index.json` (including Crossref/DataCite lookup for paper DOIs); Astro builds HTML for GitHub Pages.

## Local preview

```bash
npm install
npm run dev
```

`npm run index` walks `content/`, copies images into `public/content/`, resolves missing paper metadata, and writes `public/index.json`. `npm run build` does the same then emits `dist/`.

## Content layout

```
content/
  pages/home.md
  research/<slug>/index.md
  projects/<slug>/index.md
  people/<slug>/index.md          # optional photo.jpg
  posts/<slug>/
    index.md                      # body
    post.json                     # metadata
    *.jpg                         # optional figures
```

Research and project cards on the homepage are the folders under `content/research/` and `content/projects/`. Link them with `projects:` / `research:` slugs in the YAML front matter.

### Blog posts

Every post folder needs `index.md` and `post.json`.

Non-paper post:

```json
{
  "title": "Integrated ROS development environment",
  "date": "2024-10-28",
  "tags": ["software", "uav"],
  "excerpt": "One-line summary."
}
```

Paper post — DOI only (the indexer fills title, authors, journal, year):

```json
{
  "tags": ["paper"],
  "doi": "10.3389/feart.2024.1433662",
  "excerpt": "Optional blog teaser.",
  "selected": true
}
```

Paper post — full metadata (no network lookup if title, authors, journal/year and DOI are all present):

```json
{
  "title": "…",
  "date": "2023-11-07",
  "tags": ["paper"],
  "doi": "10.48550/arXiv.2311.03053",
  "authors": ["Elias Arbash"],
  "journal": "arXiv",
  "year": 2023
}
```

The publications page lists every post tagged `paper`. Tags also generate `/blog/tag/<tag>/`.

## GitHub Actions

On push to `main`, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs the indexer, commits an updated `public/index.json` if it changed, builds the site, and deploys to GitHub Pages. Enable Pages in the repository settings (source: GitHub Actions).

The site is served from `https://samthiele.github.io/iexplo/`. Keep `base: '/iexplo'` in `astro.config.mjs`. For a user/org site or a later custom domain, set `base` to `'/'`.
