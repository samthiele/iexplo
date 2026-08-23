## Masking hyperspectral imaging data with pretrained models

By Elias Arbash. Preprint: [arXiv:2311.03053](https://arxiv.org/abs/2311.03053)

In hyperspectral data cubes, undesired background associated with noise and unknown spectral characteristics degrades subsequent processing. Masking out unwanted regions is key: processing only regions of interest improves compute cost, memory and performance.

The proposed pipeline generates a region-of-interest mask, then applies hyperspectral processing only on the masked cube. The novelty is the segmentation step. By deploying the Segment Anything model (SAM) with Grounding DINO, followed by intersection and exclusion filtering, undesired areas are removed without retraining or fine-tuning.

On a drill-core scan the method reached precision 0.97, recall 0.98 and F1 0.97 against a hand-made ground truth, and reduced the cube from 727,000 vectors to 280,584.

Please cite Arbash et al. (2023), *Masking Hyperspectral Imaging Data with Pretrained Models*, arXiv:2311.03053.

![Cover](fig-01.png)

![Figure 1](fig-02.png)

![Figure 2](fig-03.png)

![Figure 3](fig-04.png)

![Figure 4](fig-05.png)

![Figure 5](fig-06.png)
