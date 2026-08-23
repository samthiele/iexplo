---
title: hylite hyperspectral toolboxes
years: ongoing
funding: Open-source software
research: [pointcloud, outcrop-mapping, mineral-mapping]
---

**hylite** is an open-source Python toolbox for loading and preprocessing imagery from a range of hyperspectral sensors, applying analyses such as multi-feature minimum-wavelength mapping, dimensionality reduction and band ratios, and fusing HSI with high-resolution point clouds into radiometrically corrected hyperclouds. Spectral libraries and ground or laboratory measurements can be integrated for supervised classification. The same methods apply across spectral data types — libraries, images and point clouds — so they can be analysed and combined in one workflow.

That cross-sensor, cross-modality design covers drill-core scanning and core-shed mosaics, UAV and satellite surveys (including oblique pushbroom geometry), outcrop and open-pit mapping, hyperclouds that attach spectra to 3-D geometry, and interactive work with spectral libraries. The same preprocessing, correction and visualisation tools therefore serve laboratory samples, field scenes and Earth-observation datasets.

hylite is the core of a wider open-source hyperspectral stack. Companion packages include [hycore](https://github.com/samthiele/hycore) and [hywiz](https://github.com/samthiele/hywiz) for organising and viewing drill-core libraries, [hklearn](https://github.com/samthiele/hklearn) for multi-sensor machine learning, [ispec](https://github.com/samthiele/ispec) for querying and mixing spectral libraries, [crunchy](https://github.com/samthiele/crunchy) for realtime multithreaded processing, and a developing [napari-hippo](https://github.com/samthiele/napari-hippo) interface.

Source and docs: [github.com/hifexplo/hylite](https://github.com/hifexplo/hylite), [hifexplo.github.io/hylite](https://hifexplo.github.io/hylite/hylite.html).
