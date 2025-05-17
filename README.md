# Claycode: Stylable and Deformable 2D Scannable Codes

**Marco Maida, Alberto Crescini, Marco Perronet, Elena Camuffo** 
*Transactions of Graphics (TOG), 2025*

[![Read the Paper](https://img.shields.io/badge/Read%20the%20Paper-ArXiv-blue?style=for-the-badge)](https://arxiv.org/abs/2505.08666)  

<!-- Claycodes are an aesthetically pleasing alternative to QR codes. 
Claycodes can encode arbitrary information inside an image which can be decoded at a later time. -->

<!-- [![Watch the Video](https://img.shields.io/badge/Watch%20the%20Video-Click%20Here-red?style=for-the-badge)](/Users/elenacamuffo/Documents/repositories/claycode/other/media/Claycode.mp4) -->

<video controls width="100%">
    <source src="/Users/elenacamuffo/Documents/repositories/claycode/other/media/Claycode.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>

## Abstract

This paper introduces Claycode, a novel 2D scannable code designed for extensive stylization and deformation. Unlike traditional matrix-based codes (e.g., QR codes), Claycodes encode their message in a tree structure. During the encoding process, bits are mapped into a topology tree, which is then depicted as a nesting of color regions drawn within the boundaries of a target polygon shape. When decoding, Claycodes are extracted and interpreted in real-time from a camera stream. We detail the end-to-end pipeline and show that Claycodes allow for extensive stylization without compromising their functionality. We then empirically demonstrate Claycode’s high tolerance to heavy deformations, outperforming traditional 2D scannable codes in scenarios where they typically fail.

## Structure of Repository

This repository contains all the implementation of the publication. In particular:

- `generator/`: a webpage that can generate Claycodes given some text,
- `scanner/`: an Android scanner camera app written in Kotlin,
- `experiments/`: miscellanea experiments related to Claycodes,
- `other/`: demos and media.

For further details please find instruction within each folder.

## Citation

If you consider our work useful for your research please consider citing:

```bibtex
@article{maida2025claycode, 
    title={Claycode: Stylable and Deformable 2D Scannable Codes}, 
    journal={Transactions on Graphics (TOG)}, 
    author={Maida, Marco and Crescini, Alberto and Perronet, Marco and Camuffo, Elena}, 
    year={2025}
    }
```
