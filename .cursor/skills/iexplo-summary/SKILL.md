---
name: iexplo-summary
description: >-
  Writes iExplo / HZDR-HIF paper-alert and blog summaries for a general geoscience
  audience (1–3 paragraphs, British English, no clipped ellipses). Use when drafting
  or rewriting group-website posts, Gemini paper summaries, ORCID paper teasers,
  or content for /admin/.
---

# iExplo summaries

The same guide is sent to Gemini from the unlisted editor (`src/lib/admin/iexplo-summary.md`).

## Output

- **excerpt:** one complete sentence for the blog card. Never end with `...` or `…`.
- **body:** 1–3 short paragraphs plus a DOI/publisher markdown link.
- **tags:** always `paper`, then existing blog tags where they fit (`drillcore`, `software`, `uav`, `recycling`, `dataset`, `fieldtrip`, `outcrop`, `satellite`, `3d-modelling`, `point-clouds`, `spectral-library`, `conference`, `spin-off`, `machine-learning-ai`). Do not invent a vocabulary of new tags.
- **image:** optional HTTPS URL of one open-access figure, graphical abstract, or cover (png/jpg/webp). Not a PDF and not the article landing page. Only if the URL is a real publisher/CDN figure (MDPI `article_deploy/html/images`, Frontiers, Copernicus, PLOS, PMC). If unsure, omit or `""`.
- Do not invent data. If the source abstract is truncated, write only from complete sentences.

## Length and shape

- **1–3 short paragraphs.** A paper alert is often two; a concept post may be three.
- General geoscience audience (colleagues, students, industry) — not a journal abstract.

## Voice

- British English. Direct verbs. No hype or emojis.
- **Active first-person plural** for what the group did: *We acquired…*, *We tested…*, *We mapped…*, *We found…*. Avoid *This study presents…* and *Data were acquired…*.
- Name collaborators where they matter, then stay in *we*.
- Lead with the scientific point (problem → what was done → what it showed or why it matters).
- Be concrete: sensors, wavelength ranges, materials, places, collaborators, funding when they are in the source.
- Hedge interpretation (*may*, *we suggest*) where the source is correlative.
- Cut throat-clearing (*It should be noted that*, *This paper presents a novel…*).

## Examples

### [Google Earth on Steroids](https://www.iexplo.space/post/google-earth-on-steroids)

Google Earth revolutionised the Earth sciences, geology especially: aerial imagery for the whole planet, interactively, from continents to individual folds. But the imagery is only red, green and blue. Most plants are green; most rocks are grey-brown.

Hyperspectral satellites (PRISMA, EnMAP, and forthcoming missions such as NASA SBG) record hundreds of wavelengths, many outside the visible, so rocks, minerals and plant species can be told apart by spectral fingerprints. Coverage is not yet global, and the data volume is awkward — which is why a public, browseable “hyperspectral Google Earth” still does not exist.

### [Battery recycling sensors](https://www.iexplo.space/post/new-paper-spectral-characterization-of-battery-components-from-li-ion-battery-recycling-processes)

With colleagues at TU Bergakademie Freiberg (BMBF project DIGISORT; lead author Julia Richter), we characterised millimetre-scale particles from end-of-life Li-ion batteries using optical sensors for non-contact, real-time sorting.

We compared five reflectance sensors and found the visible to near-infrared (400–1000 nm) best discriminated aluminium, copper and other battery components, and we set out practical recommendations for industrial use.

Full article: [Metals 14(2):147](https://www.mdpi.com/2075-4701/14/2/147)

### [Underground Li hyperspectral mapping](https://www.iexplo.space/post/paper-alert-hyperspectral-imaging-of-li-bearing-minerals-in-underground-mine)

We developed a workflow for hyperspectral geological mapping underground. We tested sensors and lighting in the laboratory, then acquired data in a German underground mine. From the corrected cubes we mapped mineral abundance and estimated Li content, and checked the results against laser-induced breakdown spectroscopy.

Underground illumination and geometry remain difficult, but we aim to put hyperspectral sensors into the extractive workflow — more information from the rock mass, with less environmental and operational risk.

Paper: [The Photogrammetric Record](https://onlinelibrary.wiley.com/doi/10.1111/phor.12457)
