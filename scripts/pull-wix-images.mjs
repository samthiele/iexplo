#!/usr/bin/env node
/**
 * Download images from iexplo.space into content/ folders.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const UA = 'iexplo-migrate/1.0 (https://github.com/thiele67/explo)';
const CHROME = new Set([
  '8c3277_91546abb576f4201b023158f05130293',
  '8c3277_8c302827aa6a4beaaa2a0a9629ac9f21',
  '8c3277_b2a388a683c24e978e4e5222e836bb81',
  '8c3277_a5726371f5ae43baa73e734f4b2f3204',
  '8c3277_76bc27115adc42fbb2c781b881fc6c4f',
  '8c3277_3c71f36a35884662a102c5dc3cf4bc1f',
]);

const PAGES = [
  // people
  ['people', 'richard-gloaguen', 'https://www.iexplo.space/richard'],
  ['people', 'sandra-lorenz', 'https://www.iexplo.space/sandra'],
  ['people', 'gopi-krishnan-regulan', 'https://www.iexplo.space/gopi'],
  ['people', 'margret-fuchs', 'https://www.iexplo.space/margret'],
  ['people', 'sam-thiele', 'https://www.iexplo.space/sam'],
  ['people', 'ahmed-afifi', 'https://www.iexplo.space/ahmed'],
  ['people', 'yuleika-madriz', 'https://www.iexplo.space/yuleika'],
  ['people', 'pedram-ghamisi', 'https://www.iexplo.space/pedram'],
  ['people', 'rene-booysen', 'https://www.iexplo.space/rene'],
  ['people', 'elias-arbash', 'https://www.iexplo.space/elias'],
  ['people', 'aldino-rizaldy', 'https://www.iexplo.space/aldino'],
  ['people', 'wilfried-adoni', 'https://www.iexplo.space/will'],
  ['people', 'junaidh-fareedh', 'https://www.iexplo.space/junaidh'],
  ['people', 'rupsa-chakraborty', 'https://www.iexplo.space/rupsa'],
  ['people', 'sibren-dieters', 'https://www.iexplo.space/sibren'],
  ['people', 'sabawoon-afzali', 'https://www.iexplo.space/sabawoon'],
  ['people', 'aastha-singh', 'https://www.iexplo.space/aastha'],
  ['people', 'ashitha-mudraje', 'https://www.iexplo.space/ashitha'],
  ['people', 'moritz-kirsch', 'https://www.iexplo.space/moritz'],
  // research
  ['research', 'multisensor', 'https://www.iexplo.space/r1-multisensor-1'],
  ['research', 'autonomous-platforms', 'https://www.iexplo.space/r2-drone'],
  ['research', 'mineral-mapping', 'https://www.iexplo.space/r3-characterization'],
  ['research', 'outcrop-mapping', 'https://www.iexplo.space/r4-mapping'],
  ['research', 'pointcloud', 'https://www.iexplo.space/r5-processing-1'],
  ['research', 'learning', 'https://www.iexplo.space/r6-learning'],
  ['research', 'learning', 'https://www.iexplo.space/research'],
  // projects / labs
  ['projects', 'ramses-4-ce', 'https://www.iexplo.space/ramses4ce'],
  ['projects', 'mosmin', 'https://www.iexplo.space/mosmin'],
  ['projects', 'hyperuav-1', 'https://www.iexplo.space/hyperuav'],
  ['projects', 'theiax', 'https://www.iexplo.space/a2-p-theiax'],
  ['projects', 'digisort', 'https://www.iexplo.space/a2-p-digisort'],
  ['projects', 'autotarget', 'https://www.iexplo.space/a2-p-uav'],
  ['projects', 'luna-lab', 'https://www.iexplo.space/luna-lab'],
  ['projects', 'hylite', 'https://www.iexplo.space/a3-toolboxes'],
];

const POST_BY_WIX = {
  'new-paper-maximising-the-value-of-hyperspectral-drill-core-scanning-through-real-time-processing-an':
    '2024-10-30-hyperspectral-drillcore',
  'integrated-ros-development-environment-for-uav-swarm-programming': '2024-10-28-ros-ide',
  'revolutionizing-autonomous-uav-systems-with-the-intelligent-swarm-model': '2024-10-28-intelligent-swarm',
  'an-easy-explaination-of-point-clouds': '2024-05-13-point-clouds',
  'autotarget-repository-online': '2024-03-26-autotarget-repo',
  'new-webpage-for-hyperuav-project': '2024-03-26-hyperuav-page',
  'introducing-napari-hippo': '2024-02-05-napari-hippo',
  'new-paper-spectral-characterization-of-battery-components-from-li-ion-battery-recycling-processes':
    '2024-02-01-battery-components',
  'towards-a-generalised-processing-of-hyperspectral-data-part-2': '2024-01-30-pcb-vision',
  'towards-a-generalised-processing-of-hyperspectral-data-part-1': '2023-11-07-masking-hsi',
  'paper-alert-hyperspectral-imaging-of-li-bearing-minerals-in-underground-mine': '2024-01-23-underground-li',
  'new-paper-on-a-multi-sensor-benchmark-data-set': '2023-12-19-multisensor-benchmark',
  'news-alert-conference-session-egu-2024': '2023-11-09-egu-2024',
  'remote-sensing-geology': '2023-10-13-remote-sensing-geology',
  'google-earth-on-steroids': '2023-10-04-google-earth-on-steroids',
  'tensor-decompositions-for-hyperspectral-data-processing': '2023-09-27-tensor-decompositions',
  'new-paper-alert-1': '2023-08-23-multisensor-fusion',
  'modern-3d-point-cloud-classification': '2023-08-18-point-cloud-classification',
  'new-paper-alert': '2023-08-10-earthquake-eews',
  'ros-an-open-source-framework-for-the-development-of-advanced-robotics-applications': '2023-07-20-ros-framework',
  'good-day-for-theiax': '2023-07-10-theiax-prize',
  'moskito-an-open-source-hardware': '2023-06-30-moskito',
  '3d-printing-and-drone-building-2': '2023-06-22-3d-printing-2',
  'your-title-what-s-your-blog-about-2': '2023-06-22-3d-printing-1',
  'intelligent-agent-in-the-age-of-artificial-intelligence-a-comprehensive-definition':
    '2023-06-06-intelligent-agents',
  'classification-of-uavs': '2023-05-02-classification-of-uavs',
  'explain-your-machine-learning-model-the-why-and-the-how': '2023-04-26-explain-ml',
  'drill-core-scanning-in-ireland': '2023-04-06-ireland-drillcore',
  'hif-explo-winning-at-the-helmholtz-imaging-contest': '2023-01-24-helmholtz-imaging',
  'locating-skarns-with-magnetic-survey-data-geyer-erzgebirge-optimizing-data-acquisition-procedures':
    '2022-11-02-geyer-skarns',
  'three-dimensional-km-scale-hyperspectral-data-of-well-exposed-zn-pb-mineralization-at-greenland':
    '2022-lorenz-black-angel',
  'a-multi-parameter-approach-for-recognition-of-anthropogenic-noise-in-aeromagnetic-data':
    '2022-11-02-aeromagnetic-noise',
  'the-potential-of-machine-learning-for-a-more-responsible-sourcing-of-critical-raw-materials':
    '2022-11-02-ml-responsible-sourcing',
  'unsupervised-data-fusion-with-deeper-perspective-a-novel-multisensor-deep-clustering-algorithm':
    '2022-11-02-deep-clustering',
  '1c595e1d': '2022-11-02-disko-magnetic',
  'ambient-seismic-noise-analysis-of-large-n-data-for-mineral-exploration-in-the-central-erzgebirge-ge':
    '2022-11-02-ambient-seismic',
  'integrated-test-sites-for-innovation-ecosystems': '2022-11-02-test-sites',
  'project-4': '2022-10-12-undip',
};

function mediaId(url) {
  const decoded = decodeURIComponent(url.replace(/\\u002F/g, '/'));
  const m = decoded.match(/\/media\/([A-Za-z0-9_]+(?:~|%7E)mv2[^/?#]*)/i) || decoded.match(/\/media\/([A-Za-z0-9_]+\.(?:jpg|jpeg|png|gif|webp))/i);
  if (!m) return null;
  const file = m[1].replace(/%7E/gi, '~');
  const id = file.replace(/~mv2.*$/i, '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  return { id, file, url: decoded };
}

function originalUrl(file) {
  return `https://static.wixstatic.com/media/${file}`;
}

function extOf(file) {
  const m = file.match(/\.(jpg|jpeg|png|gif|webp)/i);
  return m ? m[1].toLowerCase() : 'jpg';
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function fetchBin(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function extractMedia(html) {
  const found = new Map();
  const re = /https:\\?\/\\?\/static\.wixstatic\.com\\?\/media\\?\/[^"'\\\s>]+/gi;
  for (const raw of html.match(re) || []) {
    const clean = raw.replace(/\\u002F/g, '/').replace(/\\/g, '').replace(/&amp;/g, '&');
    const info = mediaId(clean);
    if (!info || CHROME.has(info.id)) continue;
    if (!found.has(info.id)) found.set(info.id, info);
  }
  return [...found.values()];
}

async function saveImages(kind, slug, items, { coverName = 'cover' } = {}) {
  const dir = path.join(ROOT, 'content', kind, slug);
  if (!existsSync(dir)) {
    console.warn(`skip missing folder ${kind}/${slug}`);
    return [];
  }
  const saved = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const ext = extOf(item.file);
    const name = i === 0 ? `${coverName}.${ext}` : `fig-${String(i).padStart(2, '0')}.${ext}`;
    const dest = path.join(dir, name);
    if (existsSync(dest)) {
      saved.push(name);
      continue;
    }
    try {
      const buf = await fetchBin(originalUrl(item.file));
      if (buf.length < 1500) continue;
      await writeFile(dest, buf);
      saved.push(name);
      console.log(`  ${kind}/${slug}/${name} (${Math.round(buf.length / 1024)}k)`);
    } catch (err) {
      console.warn(`  fail ${item.file}: ${err.message}`);
    }
  }
  return saved;
}

function appendFigures(mdPath, files) {
  if (!files.length || !existsSync(mdPath)) return;
  let md = '';
  return readFile(mdPath, 'utf8').then((current) => {
    md = current;
    const missing = files.filter((f) => !md.includes(f));
    if (!missing.length) return;
    const block = '\n\n' + missing.map((f, i) => `![${i === 0 ? 'Cover' : `Figure ${i}`}](${f})`).join('\n\n') + '\n';
    return writeFile(mdPath, md.trimEnd() + block);
  });
}

async function setJsonImage(jsonPath, file) {
  if (!existsSync(jsonPath) || !file) return;
  const meta = JSON.parse(await readFile(jsonPath, 'utf8'));
  if (meta.image === file) return;
  meta.image = file;
  await writeFile(jsonPath, JSON.stringify(meta, null, 2) + '\n');
}

async function setFrontmatterImage(mdPath, file) {
  if (!existsSync(mdPath) || !file) return;
  const raw = await readFile(mdPath, 'utf8');
  if (!raw.startsWith('---')) return;
  if (/^image:/m.test(raw)) {
    await writeFile(mdPath, raw.replace(/^image:.*$/m, `image: ${file}`));
    return;
  }
  await writeFile(mdPath, raw.replace(/^---\n/, `---\nimage: ${file}\n`));
}

async function pullPage(kind, slug, url, coverName) {
  const html = await fetchText(url);
  const media = extractMedia(html);
  const saved = await saveImages(kind, slug, media, { coverName });
  if (saved[0]) {
    if (kind === 'posts') await setJsonImage(path.join(ROOT, 'content', kind, slug, 'post.json'), saved[0]);
    else await setFrontmatterImage(path.join(ROOT, 'content', kind, slug, 'index.md'), saved[0]);
  }
  if (kind !== 'people') {
    await appendFigures(path.join(ROOT, 'content', kind, slug, 'index.md'), saved.slice(1));
  }
  return saved;
}

async function main() {
  const sitemap = await fetchText('https://www.iexplo.space/blog-posts-sitemap.xml');
  const blocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  const posts = [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const img = block.match(/<image:loc>([^<]+)<\/image:loc>/)?.[1];
    if (!loc) continue;
    const wix = loc.replace(/.*\/post\//, '');
    const slug = POST_BY_WIX[wix];
    if (!slug) {
      console.warn(`unmapped post ${wix}`);
      continue;
    }
    posts.push({ slug, loc, img });
  }

  console.log(`Blog posts in sitemap: ${posts.length}`);
  for (const post of posts) {
    console.log(post.slug);
    try {
      await pullPage('posts', post.slug, post.loc, 'cover');
    } catch (err) {
      console.warn(`  page fail: ${err.message}`);
      if (post.img) {
        const info = mediaId(post.img);
        if (info) await saveImages('posts', post.slug, [info], { coverName: 'cover' });
      }
    }
  }

  for (const [kind, slug, url] of PAGES) {
    console.log(`${kind}/${slug}`);
    try {
      await pullPage(kind, slug, url, kind === 'people' ? 'photo' : 'cover');
    } catch (err) {
      console.warn(`  fail ${url}: ${err.message}`);
    }
  }

  // Homepage research/project cards
  try {
    console.log('homepage');
    const html = await fetchText('https://www.iexplo.space/');
    const media = extractMedia(html);
    await saveImages('pages', '.', media.filter(() => false));
    const homeDir = path.join(ROOT, 'content', 'pages');
    await mkdir(homeDir, { recursive: true });
    let i = 0;
    for (const item of media.slice(0, 8)) {
      const ext = extOf(item.file);
      const dest = path.join(homeDir, `home-${String(++i).padStart(2, '0')}.${ext}`);
      if (existsSync(dest)) continue;
      try {
        const buf = await fetchBin(originalUrl(item.file));
        if (buf.length < 1500) continue;
        await writeFile(dest, buf);
        console.log(`  pages/${path.basename(dest)}`);
      } catch {}
    }
  } catch (err) {
    console.warn(err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
