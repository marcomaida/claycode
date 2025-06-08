# Claycode: Stylable and Deformable 2D Scannable Codes

**Marco Maida, Alberto Crescini, Marco Perronet, Elena Camuffo** 
*Transactions of Graphics (TOG), 2025*

[![Read the Paper](https://img.shields.io/badge/Read%20the%20Paper-ArXiv-blue?style=for-the-badge)](https://arxiv.org/abs/2505.08666)  

[![Watch the Video](https://img.shields.io/badge/Watch%20the%20Video-YouTube-red?style=for-the-badge)](https://www.youtube.com/watch?v=Sx9k2iyXQhY)

[![Claycode Demo Video](https://img.youtube.com/vi/Sx9k2iyXQhY/0.jpg)](https://www.youtube.com/watch?v=Sx9k2iyXQhY)

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
## License

This project is licensed under the MIT License with the Commons Clause.

You are free to use, modify, and distribute this code for non-commercial purposes. Commercial use is prohibited without obtaining a commercial license. For commercial use inquiries, please contact the authors.
