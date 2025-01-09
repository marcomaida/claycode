import csv
import random
import math
import os
from pathlib import Path
import cv2
import yaml  # Ensure PyYAML is installed: pip install pyyaml
from itertools import product

# Rotations will be generated in the range [-ROTATION_MIN_MAX, ROTATION_MIN_MAX]
ROTATION_MIN_MAX = 20 
NUMBER_OF_TEST_CASES_PER_EXPERIMENT=5

# Min and max frequency of the sin wave that deforms the code
MIN_WAVE_FREQUENCY = 1
MAX_WAVE_FREQUENCY = 3

FOLDER_NAME = "results/template-cube-line-rotate"
TEMPLATE_FILE = os.path.join(FOLDER_NAME, "template.csv")
CONFIG_FILE = "config.yaml"  # Path to your YAML config file

IMAGES_FOLDER = "images/testing-scenario"

def load_config(config_path: str):
    """
    Load the YAML configuration file.
    """
    try:
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
            return config['experiment_parameters']
    except FileNotFoundError:
        print(f"Configuration file '{config_path}' not found.")
        exit(1)
    except KeyError:
        print("Invalid configuration format. Ensure 'experiment_parameters' section exists.")
        exit(1)
    except yaml.YAMLError as exc:
        print(f"Error parsing YAML file: {exc}")
        exit(1)


def get_all_image_files(images_dir: Path):
    """
    Retrieve all image files from the specified directory with common image extensions.
    """
    supported_extensions = {".png", ".jpg", ".jpeg", ".bmp"}
    return sorted([
        f for f in images_dir.iterdir()
        if f.is_file() and f.suffix.lower() in supported_extensions
    ])


def generate_square_experiments(params, width, height, filename, wave_amplitude, wave_frequency, rotation):
    """
    Generate square experiments for given wave amplitude and frequency.
    """
    experiments = []
    for square_dimension_perc in params['square_dimension_perc_range']:
        square_size = int(square_dimension_perc * min(width, height))

        margin = square_size // 2
        min_x = margin
        max_x = width - margin
        min_y = margin
        max_y = height - margin

        # Random center for the square
        square_position = (
            random.randint(min_x, max_x),
            random.randint(min_y, max_y),
        )

        experiment_data = {
            "experiment_id": None,  # To be assigned later
            "successful": "",
            "wave_amplitude": wave_amplitude,
            "wave_frequency": wave_frequency,
            "square_position": str(square_position),
            "square_dimension_perc": square_dimension_perc,
            "line_center_coordinates": "",
            "line_thickness_perc": 0.0,
            "line_dimension_perc": 0.0,
            "line_angle": 0,
            "rotation": rotation,
            "filename": filename
        }
        experiments.append(experiment_data)
    return experiments


def generate_line_experiments(params, width, height, filename, wave_amplitude, wave_frequency, rotation):
    """
    Generate line experiments for given wave amplitude and frequency.
    """
    experiments = []
    for line_thickness_perc, line_dimension_perc, line_angle in product(
        params['line_thickness_perc_range'],
        params['line_dimension_perc_range'],
        params['line_angle_range']
    ):
        max_length = line_dimension_perc * min(width, height)
        angle_rad = math.radians(line_angle)
        margin_x = (max_length / 2) * abs(math.cos(angle_rad))
        margin_y = (max_length / 2) * abs(math.sin(angle_rad))

        min_x = int(margin_x)
        max_x = int(width - margin_x)
        min_y = int(margin_y)
        max_y = int(height - margin_y)

        # Random center for the line
        line_center = (
            random.randint(min_x, max_x),
            random.randint(min_y, max_y),
        )

        experiment_data = {
            "experiment_id": None,  # To be assigned later
            "successful": "",
            "wave_amplitude": wave_amplitude,
            "wave_frequency": wave_frequency,
            "square_position": "",
            "square_dimension_perc": 0.0,
            "line_center_coordinates": str(line_center),
            "line_thickness_perc": line_thickness_perc,
            "line_dimension_perc": line_dimension_perc,
            "line_angle": line_angle,
            "rotation": rotation,
            "filename": filename
        }
        experiments.append(experiment_data)
    return experiments


def assign_experiment_ids(experiments):
    """
    Assign unique experiment IDs sequentially.
    """
    for idx, exp in enumerate(experiments):
        exp["experiment_id"] = idx
    return experiments


def create_test_cases_for_all_images():
    """
    1. Reads all images in `images/testing-scenario/`.
    2. For each image, obtains width/height.
    3. Generates squares/lines experiments specifically for that image's dimension.
    4. Appends them to a single CSV (template.csv) with a `filename` column.
    5. Implements testing to ensure Cartesian products are correctly applied.
    """

    # Remember to insert the 0.00 line thickness scenario for testing the distortion without any line.
    # Load experiment parameters from YAML config
    params = load_config(CONFIG_FILE)

    # Ensure the top-level folder for our CSV exists
    Path(FOLDER_NAME).mkdir(exist_ok=True, parents=True)

    # Gather all images
    images_dir = Path(IMAGES_FOLDER)
    if not images_dir.exists():
        raise FileNotFoundError(f"No such folder: {images_dir}")

    all_image_files = get_all_image_files(images_dir)
    if not all_image_files:
        raise FileNotFoundError(f"No images found in {images_dir}")

    print(f"[INFO] Found {len(all_image_files)} images in {images_dir}")

    all_experiments = []
    experiment_id = 0

    # For each image, read its dimension, then generate squares/lines
    for image_path in all_image_files:
        img = cv2.imread(str(image_path))
        if img is None:
            print(f"Skipping {image_path}, could not read.")
            continue

        height, width = img.shape[:2]
        filename = image_path.name  # e.g. "my_image.png"

        # --- SQUARE TEST CASES (for this specific image) ---
        for wave_amplitude, _ in product(
            params['wave_amplitude_range'],
            range(NUMBER_OF_TEST_CASES_PER_EXPERIMENT)
        ):
            # Note: changing rotation to be random
            wave_frequency = round(random.uniform(MIN_WAVE_FREQUENCY, MAX_WAVE_FREQUENCY),2)
            random_rotation = [random.randint(-ROTATION_MIN_MAX, ROTATION_MIN_MAX),
                               random.randint(-ROTATION_MIN_MAX, ROTATION_MIN_MAX)]
            squares = generate_square_experiments(
                params, width, height, filename, wave_amplitude, wave_frequency, random_rotation
            )
            all_experiments.extend(squares)

        # --- LINE TEST CASES (for this specific image) ---
        # NOTE: we disabled lines for now. Re-enabling involves
        # correctly handling NUMBER_OF_TEST_CASES_PER_EXPERIMENT

        # for wave_amplitude, wave_frequency, _ in product(
        #     params['wave_amplitude_range'],
        #     params['wave_frequency_range'],
        #     range(NUMBER_OF_TEST_CASES_PER_EXPERIMENT)
        # ):
        #     random_rotation = [random.randint(-ROTATION_MIN_MAX, ROTATION_MIN_MAX),
        #                        random.randint(-ROTATION_MIN_MAX, ROTATION_MIN_MAX)]
        #     lines = generate_line_experiments(
        #         params, width, height, filename, wave_amplitude, wave_frequency, random_rotation
        #     )
        #     all_experiments.extend(lines)

    # Assign unique experiment IDs
    all_experiments = assign_experiment_ids(all_experiments)

    # Write all experiments to template.csv
    fieldnames = [
        "experiment_id", "successful", "wave_amplitude", "wave_frequency",
        "square_position", "square_dimension_perc", "line_center_coordinates",
        "line_thickness_perc", "line_dimension_perc", "line_angle", "rotation",
        "filename"
    ]

    with open(TEMPLATE_FILE, mode="w", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in all_experiments:
            writer.writerow(row)

    print(f"Created '{TEMPLATE_FILE}' with {len(all_experiments)} experiments "
          f"for {len(all_image_files)} images.")

    # --- Testing ---
    # Calculate expected number of experiments
    expected_squares = len(all_image_files) * (
        len(params['wave_amplitude_range']) *
        len(params['square_dimension_perc_range']) *
        NUMBER_OF_TEST_CASES_PER_EXPERIMENT
    )
    expected_lines = len(all_image_files) * (
        len(params['wave_amplitude_range']) *
        len(params['line_thickness_perc_range']) *
        len(params['line_dimension_perc_range']) *
        len(params['line_angle_range'])
    )
    expected_total = expected_squares + expected_lines

    actual_total = len(all_experiments)

    assert actual_total == expected_total, (
        f"Test Failed: Expected {expected_total} experiments, "
        f"but got {actual_total}."
    )
    print(f"[TEST PASS] Correct number of experiments generated: {actual_total}")


if __name__ == "__main__":
    create_test_cases_for_all_images()