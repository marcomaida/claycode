import csv
import random
import os
from pathlib import Path
import cv2
import yaml
from itertools import product

# NOISE FACTORS: We introduce a rotation factor from a range of (-ROTATION_MAX, -ROTATION_MIN) v (ROTATION_MIN, ROTATION_MAX) and a range of frequency for the sinusoidal funciton.

ROTATION_MIN = 10
ROTATION_MAX = 20
MIN_WAVE_FREQUENCY = 1
MAX_WAVE_FREQUENCY = 2

# We define how many times to replicate a single experiment, changing the noise parameters.
NUMBER_OF_TEST_CASES_PER_EXPERIMENT=2

FOLDER_NAME = "results/testing-scenario"
TEMPLATE_FILE = os.path.join(FOLDER_NAME, "template.csv")
CONFIG_FILE = "config.yaml"
IMAGES_FOLDER = "images/testing-scenario"

def random_rotation():
    sign = random.choice([1, -1])
    number = random.randint(ROTATION_MIN, ROTATION_MAX)

    return sign * number

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
    3. Appends them to a single CSV (template.csv) with a `filename` column.
    4. Implements testing to ensure Cartesian products are correctly applied.
    """
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

    # For each image, read its dimension, then generate squares
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
            wave_frequency = round(random.uniform(MIN_WAVE_FREQUENCY, MAX_WAVE_FREQUENCY),2)
            rotation = [random_rotation() ,random_rotation()]
            squares = generate_square_experiments(
                params, width, height, filename, wave_amplitude, wave_frequency, rotation
            )
            all_experiments.extend(squares)

    # Assign unique experiment IDs
    all_experiments = assign_experiment_ids(all_experiments)

    # Write all experiments to template.csv
    fieldnames = [
        "experiment_id", "successful", "wave_amplitude", "wave_frequency",
        "square_position", "square_dimension_perc", "rotation", "filename"
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
    expected_total = len(all_image_files) * (
        len(params['wave_amplitude_range']) *
        len(params['square_dimension_perc_range']) *
        NUMBER_OF_TEST_CASES_PER_EXPERIMENT
    )

    actual_total = len(all_experiments)

    assert actual_total == expected_total, (
        f"Test Failed: Expected {expected_total} experiments, "
        f"but got {actual_total}."
    )
    print(f"[TEST PASS] Correct number of experiments generated: {actual_total}")


if __name__ == "__main__":
    create_test_cases_for_all_images()
