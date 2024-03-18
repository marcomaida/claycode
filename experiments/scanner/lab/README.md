# Scanner Lab

This folder contains the groundwork for the newer scanner, that is able to detect and decode a claycode from an arbitrary input image. 

- **Color Quantization**: Reduce the number of colors in the input image to remove noise
- **Segmentation**: Classify each color region into shape, i.e., assign a unique number to each pixel according to its region
- **Topology Analysis**: Given the image segmented into shapes, build a tree describing the topology of the shapes


# Topology Analysis

Under the `topology/` directory, you can find a set of 64x64 images containing sample topologies. These images mock the output of a color quantization procedure, with the additional assumption that each color is used only once. This assumption greatly simplifies the segmentation process (no flooding algorithm is needed to segment at runtime) and lets us focus on topology analysis.