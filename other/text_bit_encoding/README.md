# SVC Text-Bit Encoding

This folder is dedicated to the development of the General-Purpose Scannable Visual Code Text-Bit Encoding.

The goal is to reach a standard that covers nowaday's major use-cases for scannable visual codes.

## Folder Organization

The **`datasets/`** folder contains a series of datasets, which are lists of strings, divided by topic. The datasets are encoded in `.md` format to be readable. 
The datasets are interpreted in a custom way: 
- Each line is a separate message
- All lines starting with `#` are ignored (treated as comments). Note that whitespaces are still considered as strings.

The **`lab/`** folder contains validations and evaluations for the encodings. The `validation` notebook contains an induction on multimodal encodings.
The **`text_bit/`** folder contains all the implementation code.
