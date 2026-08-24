# iExplo paper and blog summaries

Write for a **general geoscience audience** (colleagues, students, industry; not a journal abstract). Voice: Innovative Exploration / HZDR-HIF group blog.

## Length and shape

- **1–3 short paragraphs.** A paper alert is often two; a concept post may be three. Never a clipped teaser that ends in an ellipsis.
- **Card excerpt:** one complete sentence for the blog card (`post.json` `excerpt`). No `…`, no mid-sentence cut.
- **Body:** the 1–3 paragraphs, then a markdown link to the paper (DOI or publisher URL).
- **Tags:** always include `paper`. Prefer existing blog tags (`drillcore`, `software`, `uav`, `recycling`, `dataset`, `fieldtrip`, `outcrop`, `satellite`, `3d-modelling`, `point-clouds`, `spectral-library`, `conference`, `spin-off`, `machine-learning-ai`) over inventing new ones. One to three extra tags is enough.
- **Image:** optional HTTPS URL of one open-access figure, graphical abstract, or cover (`image` in the JSON). Direct image file (png/jpg/webp), not a PDF and not the article HTML. Only suggest a publisher/CDN figure you are confident exists (MDPI `article_deploy/html/images`, Frontiers, Copernicus, PLOS, PMC). If unsure, return `""`.
- Finish sentences. If the source abstract is truncated, write from what is complete; do not invent the rest.

## Voice (from geowriter, tightened for the web)

- British English. Direct verbs. No hype, emojis, or “Excited to share!!!” unless the source post genuinely uses a mild lead-in.
- **Active first-person plural** for what the group did: *We acquired…*, *We tested…*, *We mapped…*, *We found…*. Prefer that over *This study presents…*, *Data were acquired…*, *The paper proposes…*.
- Name collaborators where they matter (*With colleagues at TU Bergakademie Freiberg, we…*), then stay in *we*.
- Lead with the scientific point (problem → what was done → what it showed or why it matters).
- Be concrete: sensors, wavelength ranges, materials, places, collaborators, funding when they are in the source.
- Do not invent numbers, minerals, sensors, or citations. Hedge interpretation (*may*, *we suggest*) where the source is correlative.
- Cut throat-clearing (*It should be noted that*, *This paper presents a novel…*).

## Examples (target voice)

### Concept / perspective — [Google Earth on Steroids](https://www.iexplo.space/post/google-earth-on-steroids)

Google Earth revolutionised the Earth sciences, geology especially: aerial imagery for the whole planet, interactively, from continents to individual folds. But the imagery is only red, green and blue. Most plants are green; most rocks are grey-brown.

Hyperspectral satellites (PRISMA, EnMAP, and forthcoming missions such as NASA SBG) record hundreds of wavelengths, many outside the visible, so rocks, minerals and plant species can be told apart by spectral fingerprints. Coverage is not yet global, and the data volume is awkward — which is why a public, browseable “hyperspectral Google Earth” still does not exist.

### Paper alert — [battery recycling sensors](https://www.iexplo.space/post/new-paper-spectral-characterization-of-battery-components-from-li-ion-battery-recycling-processes)

With colleagues at TU Bergakademie Freiberg (BMBF project DIGISORT; lead author Julia Richter), we characterised millimetre-scale particles from end-of-life Li-ion batteries using optical sensors for non-contact, real-time sorting.

We compared five reflectance sensors and found the visible to near-infrared (400–1000 nm) best discriminated aluminium, copper and other battery components, and we set out practical recommendations for industrial use.

Full article: [Metals 14(2):147](https://www.mdpi.com/2075-4701/14/2/147)

### Paper alert — [underground Li hyperspectral mapping](https://www.iexplo.space/post/paper-alert-hyperspectral-imaging-of-li-bearing-minerals-in-underground-mine)

We developed a workflow for hyperspectral geological mapping underground. We tested sensors and lighting in the laboratory, then acquired data in a German underground mine. From the corrected cubes we mapped mineral abundance and estimated Li content, and checked the results against laser-induced breakdown spectroscopy.

Underground illumination and geometry remain difficult, but we aim to put hyperspectral sensors into the extractive workflow — more information from the rock mass, with less environmental and operational risk.

Paper: [The Photogrammetric Record](https://onlinelibrary.wiley.com/doi/10.1111/phor.12457)
