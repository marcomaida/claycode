# Quick start

First install all the dependencies.

```bash
python3 -m pip install -r requirements.txt
```

## Scanner resiliency evaluation

1) Generate the dataset `make -C scan_comparison generate_test_cases`
2) Try out the setup used for the scanner evaluation `make -C scan_comparison evaluation`

Finally, to produce specific plots, simply run the notebooks located in the subdirectories in `scan_comparison/saved_results`

## Scanner latency and tree descendants evaluations

To produce the plots based on the dataset, simply run the notebooks in `scanner_latency` and `tree_descendants`.

## Bit to tree encoding comparison

1) Generate the dataset by running the notebook `bit_tree_encoding_comparison/encoding_comparison_generation.ipynb` (can take more than 10 minutes)
2) Generate the plots from the dataset by running the notebook `bit_tree_encoding_comparison/encoding_comparison_results.ipynb`
