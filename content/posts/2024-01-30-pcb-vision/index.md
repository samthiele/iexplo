PCB-Vision: A Multiscene RGB-Hyperspectral Benchmark Dataset of Printed Circuit Boards

By Elias Arbash

The paper is available at: [https://arxiv.org/pdf/2401.06528.pdf](https://arxiv.org/pdf/2401.06528.pdf)

The data is available at: [https://rodare.hzdr.de/record/2704](https://rodare.hzdr.de/record/2704)

The codes are available at: [https://github.com/hifexplo/PCBVision](https://github.com/hifexplo/PCBVision)

PCB-Vision Segmentation Training Set

### Introduction

Our commitment to advancing non-invasive optical analysis of E-waste materials has led to the creation of PCB-Vision; a groundbreaking work that introduces a Multiscene RGB-Hyperspectral Benchmark Dataset of Printed Circuit Boards (PCBs). This initiative aims to drive innovation in the E-waste recycling industry by providing comprehensive quantitative and qualitative insights into PCB materials and components through the fusion of RGB and hyperspectral imaging.

PCB Vision Building Steps & Pipelines

### Key Achievements

1. **Multiscene HSI**

PCB-Vision introduces a unique dataset featuring 53 multiscene hyperspectral data cubes in the VNIR range, meticulously separated from their corresponding RGB images. This groundbreaking approach unlocks new possibilities for optical analysis and sets a benchmark for future projects.

Furthermore, PCB-Vision includes:

RGB images of 53 PCBs scanned with a high-resolution RGB camera (Teledyne Dalsa C4020).

53 hyperspectral data cubes of those PCBs scanned with Specim FX10 in the VNIR range.

Two segmentation ground truth files: 'General' and 'Monoseg' for 4 classes of interest - 'others,' 'IC,' 'Capacitor,' and 'Connectors.'

HSI PCB forgeround/background masks.

PCB1 'General' Ground Truth

PCB1 'Monoseg' Ground Truth

2. **End-to-end processing with Deep Learning Models**

The accompanying GitHub repository (link: [PCBVision Repo](https://github.com/hifexplo/PCBVision)) not only houses the dataset but also includes a collection of clean and insightful code. This code walks you through the details of handling large-scale data and guides you in building, training, and evaluating deep learning models for optimal performance.

What are the important features you will find inside the code?

Reading function to automate the reading and extraction of the data.

HS Data cubes values limiting and bands slicing.

5 state-of-the-art deep learning segmentation models for Unet, Attention Unet, Res Unet, DeepLabv3+, and LinkNet were collected and prepared for deployment.

DL segmentation pipeline for the above mentioned models applied on three main data types:

RGB images.

PCA data of the HS cubes.

128x128x214 patches of the HS cubes.

PCB Vision Workflow

### Motivation and Challenges

**Motivation**

Our driving force is to encourage the community to develop robust end-to-end models that exhibit optimal generalization on unseen hyperspectral data. PCB-Vision serves as a benchmark, providing insights into the current capabilities of models and signaling the need for advancements in handling multiscene data.

While we've made significant strides, numerous challenges await, including:

Enhancing the generalization ability of segmentation models.

Fast real-time HSI processing suitable for industrial applications.

Data fusion and multi-data input models development combining the vital features of the two data types.

Pansharpening and Super-resolution restoration models that can utilize the trained backbones models on PCB-vision.

Fitting and deploying large vision models to handle such large data complexities.

PCB Vision Segmentation Test Set

### Applications and Opportunities

The PCB-Vision dataset and code open doors for developing sophisticated optical inspection methods for PCBs and non-invasive analysis of E-waste. The opportunities for improvement and exploration are vast, offering a valuable resource for practitioners without the need for expensive setups.

### Contributions and Contact

Your comments and contributions are highly valued. Feel free to fork, edit, and push enhancements to different branches.

For direct contact, email Elias Arbash ([e.arbash@hzdr.de](mailto:e.arbash@hzdr.de)) or visit [iexplo.space](http://iexplo.space).

### Licensing and Citation

The code and work are licensed under the "Apache-2.0 license and "CC BY-NC-SA 4.0 DEED Attribution-NonCommercial-ShareAlike 4.0 International", emphasizing the importance of open development and sharing within the community. When using the materials or dataset, kindly cite the following:

Word

Arbash, Elias, Fuchs, Margret, Rasti, Behnood, Lorenz, Sandra, Ghamisi, Pedram, & Gloaguen, Richard. (2024). PCB-Vision: A Multiscene RGB-Hyperspectral Benchmark Dataset of Printed Circuit Boards (Version 1) [Data set]. Rodare. [http://doi.org/10.14278/rodare.2704](http://doi.org/10.14278/rodare.2704)

**LaTeX**

@article{arbash2024pcb, title={PCB-Vision: A Multiscene RGB-Hyperspectral Benchmark Dataset of Printed Circuit Boards}, author={Arbash, Elias and Fuchs, Margret and Rasti, Behnood and Lorenz, Sandra and Ghamisi, Pedram and Gloaguen, Richard}, journal={arXiv preprint arXiv:2401.06528}, year={2024} }

### Conclusion

In conclusion, PCB-Vision stands at the forefront of innovative E-waste analysis, offering a rich dataset and comprehensive codebase to propel research and development in the field. Join us in this journey towards a more sustainable and efficient E-waste recycling industry.

### Acknowledgment

The authors express their gratitude to EIT RawMaterials for funding the project ’RAMSES-4-CE’ (KIC RM 19262). Appreciation is extended to the European Regional Development Fund (EFRE) and the Land of Saxony for their support

in funding the computational equipment under the project ’CirculAIre.’

Helmholtz-Zentrum Dresden-Rossendorf

Helmholtz Institute Freiberg for Resource Technology

Exploration Department

![Cover](fig-01.png)

![Figure 1](fig-02.png)

![Figure 2](fig-03.png)

![Figure 3](fig-04.png)

![Figure 4](fig-05.png)

