# Evaluation of Claycodes vs QR Codes and Other Technologies

This project evaluates the reliability of **Claycodes** compared to **QR Codes** and other technologies.

## Overview

The evaluation script:
- Displays a **3D PyVista Plotter**, showcasing a code with transformations applied as defined in a template CSV file.
- Allows users to determine the scannability of the displayed code through keyboard interaction.
- Saves results in CSV files, organized within timestamped folders for improved traceability and resilience.

## Features

- **Interactive Evaluation**: 
  - Use keyboard inputs to assess scannability.
  - Navigate forward or backward through test cases.
- **Automatic Result Saving**: 
  - Results are saved in a new CSV file for every test scenario.
  - Timestamped folders ensure clear organization and traceability.
- **Flexible Configuration**: 
  - Transformations applied to codes are configurable via the template CSV file.

## How to Use

1. **Run the Script**: Launch the evaluation script to display a **3D PyVista Plotter**.
2. **Evaluate Scannability**:
   - Press the **Right Arrow** if the code is scannable.
   - Press the **Left Arrow** if the code cannot be scanned.
   - Press the **Z Key** to go back to the previous image.
3. **View Results**:
   - Results are saved in a CSV file within a timestamped folder.
   - Each testing scenario generates a new CSV file to ensure resilience and traceability.

## Configuration: YAML File for Testing Scenarios

Testing scenarios are defined in a YAML file. The `generate_test_cases` script reads this file to create the experiment template. Below is an example of the structure and parameters used:

```yaml
# This file contains the parameters to use to create the experiment template

# Square Experiment
experiment_parameters:
  wave_amplitude_range: [0.2] # Define wave amplitude values to test, make sure to add the 0.0 case in case you want to ignore iterating through waves.
  square_dimension_perc_range: [0.1, 0.2, 0.3, 0.4, 0.5] # Variations in square dimensions, make sure to add the 0.0 case in case you want to ignore iterating through squares.
```
# Evaluation of Claycodes vs QR Codes and Other Technologies

This project evaluates the reliability of **Claycodes** compared to **QR Codes** and other technologies.

## How to Use

1. **Generate the Template File**:  
   Run `make generate_testcases` to load the `config.yaml` file and generate the `template.csv` file with the testing scenarios, based on the images stored in the `testing-scenario` folder.

2. **Run the Script**:  
   Launch the evaluation script to display a **3D PyVista Plotter** using the command:  `make evaluation`