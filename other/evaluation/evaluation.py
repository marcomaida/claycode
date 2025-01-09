import cv2
import pyvista as pv
import numpy as np
import time
import math
import os
import shutil
from datetime import datetime
from pathlib import Path

from eval_lib.experiment import Experiment

# ----------------------------
#   GLOBAL SETTINGS
# ----------------------------

# The top-level folder holding the template plus scenario subfolders.
# Example: "results/template-cube-line-rotate"
EXPERIMENT_FOLDER = "results/template-cube-line-rotate"

# The base CSV file (e.g., "template.csv") inside that folder
TEMPLATE_CSV = os.path.join(EXPERIMENT_FOLDER, "template.csv")

# We'll store new scenario files under "experiment_YYYYmmdd_HHMMSS/"
# inside the same folder.
# e.g.: template-cube-line-rotate/experiment_20250103_103000

# The location of images we reference in the CSV (filename column).
# e.g., "images/testing-scenario"
IMAGES_FOLDER = "images/testing-scenario"

# Temporary location for modified textures
TEMP_TEXTURE = "images/temp/modified_texture.png"

# If you want rotation, you can define it here (0 means no rotation)
ROTATION_ANGLE = 0


# ----------------------------
#   CREATE / LOAD SCENARIO
# ----------------------------

def get_most_recent_experiment_subfolder(base_path: Path):
    """
    Returns the most recently modified subfolder under base_path
    whose name starts with "experiment_". Or None if none exist.
    """
    candidates = [
        p for p in base_path.iterdir()
        if p.is_dir() and p.name.startswith("experiment_")
    ]
    if not candidates:
        return None
    candidates.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return candidates[0]

def find_highest_scenario_csv(folder: Path):
    """
    Find the scenario_XX.csv with the highest XX in 'folder'.
    Returns (Path, int) or (None, -1) if none found.
    """
    scenario_files = []
    for f in folder.glob("scenario_*.csv"):
        name = f.name
        try:
            idx_str = name.replace("scenario_", "").replace(".csv", "")
            idx = int(idx_str)
            scenario_files.append((f, idx))
        except ValueError:
            pass
    if not scenario_files:
        return (None, -1)
    scenario_files.sort(key=lambda x: x[1], reverse=True)
    return scenario_files[0]

def find_first_incomplete_index():
    """
    Return the index (0-based) of the first experiment in memory
    that has `successful in (None, '')`. If all are done, return 0
    (or len(exps), up to you).
    """
    exps = Experiment.load_all()
    for i, e in enumerate(exps):
        if e.successful in (None, ''):
            return i
    return 0  # or len(exps) if you'd rather skip if all done.

def write_scenario_csv(index, folder: Path):
    """
    Write the entire in-memory experiment list to scenario_{index}.csv
    inside the given folder.
    """
    out_path = folder / f"scenario_{index}.csv"
    Experiment.write_all(csv_path=str(out_path))
    print(f"[SCENARIO] Wrote snapshot -> {out_path}")


# ----------------------------
#   DRAWING HELPERS
# ----------------------------

def draw_square_on_image(image, exp, width, height):
    """
    Draws a filled red square based on exp.square_position
    and exp.square_dimension_perc, which is a fraction of min(width, height).
    """
    square_size = int(exp.square_dimension_perc * min(width, height))
    if square_size < 1:
        return

    cx, cy = exp.square_position  # (x, y)
    tlx = max(0, cx - square_size // 2)
    tly = max(0, cy - square_size // 2)
    brx = min(width - 1, cx + square_size // 2)
    bry = min(height - 1, cy + square_size // 2)

    cv2.rectangle(
        image,
        (tlx, tly),
        (brx, bry),
        (0, 0, 255),  # Red in BGR
        thickness=-1
    )

def draw_line_on_image(image, exp, width, height):
    """
    Draws a red line based on exp.line_center_coordinates,
    exp.line_dimension_perc, exp.line_angle, exp.line_thickness_perc.
    """
    (cx, cy) = exp.line_center_coordinates
    length = exp.line_dimension_perc * min(width, height)
    angle_rad = math.radians(exp.line_angle)

    dx = (length / 2) * math.cos(angle_rad)
    dy = (length / 2) * math.sin(angle_rad)

    x1, y1 = cx - dx, cy - dy
    x2, y2 = cx + dx, cy + dy

    thickness = int(exp.line_thickness_perc * min(width, height))
    cv2.line(
        image,
        (int(x1), int(y1)),
        (int(x2), int(y2)),
        (0, 0, 255),
        thickness
    )


# ----------------------------
#   PYVISTA / PLOTTING
# ----------------------------

plotter = pv.Plotter()
plotter.add_background_image("images/landscape.png")  # Optional
plotter.camera_position = [(0, 0, 5), (0, 0, 0), (0, 1, 0)]
plotter.enable_lightkit()

plane = None  # We'll store the wave mesh

def create_sinusoidal_plane_mesh(size=2.0, wave_amplitude=0.3, wave_frequency=3):
    half_size = size / 2
    resolution = 100
    x = np.linspace(-half_size, half_size, resolution)
    y = np.linspace(-half_size, half_size, resolution)
    xv, yv = np.meshgrid(x, y)
    zv = wave_amplitude * np.sin(wave_frequency * xv) * np.cos(wave_frequency * yv)

    verts = np.column_stack((xv.ravel(), yv.ravel(), zv.ravel()))
    faces = []
    for i in range(resolution - 1):
        for j in range(resolution - 1):
            idx0 = i*resolution + j
            idx1 = idx0 + 1
            idx2 = idx0 + resolution + 1
            idx3 = idx0 + resolution
            faces.extend([4, idx0, idx1, idx2, idx3])

    mesh = pv.PolyData(verts, faces)
    mesh.texture_map_to_plane(inplace=True)
    return mesh

def show_key_popup(key: str):
    if key == 'z':
        txt = "PREVIOUS"
    elif key == 'Right':
        txt = "ACCEPTED"
    elif key == 'Left':
        txt = "REJECTED"
    else:
        txt = f"KEY: {key}"

    text_actor = plotter.add_text(txt, position="lower_left",
                                  font_size=50, color="white",
                                  font="courier", shadow=True,
                                  name="key_popup")
    plotter.background_color = "white"
    plotter.render()
    time.sleep(0.3)
    plotter.remove_actor("key_popup")
    plotter.background_color = "black"
    plotter.render()

def update_experiment_text(exp):
    """
    Displays text for the current experiment on the upper-left.
    """
    txt = (
        f"ID: {exp.experiment_id}\n"
        f"Filename: {exp.filename}\n"
        f"WaveAmp: {exp.wave_amplitude}\n"
        f"WaveFreq: {exp.wave_frequency}\n"
        f"SquarePos: {exp.square_position}\n"
        f"LinePos: {exp.line_center_coordinates}\n"
        f"Outcome: {exp.successful}\n"
    )
    plotter.add_text(txt, position="upper_left", font_size=10,
                     color="black", shadow=True, name="experiment_text")

def record_experiment_result(outcome: bool, index: int):
    exps = Experiment.load_all()
    if 0 <= index < len(exps):
        exps[index].edit(successful=outcome)

def rotate_texture(image_path: str, angle: float) -> str:
    """
    Rotates the entire 2D image. If angle=0, we skip rotation.
    """
    if angle == 0:
        return image_path

    img = cv2.imread(image_path)
    if img is None:
        print(f"[rotate_texture] Could not read {image_path}")
        return image_path

    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    rot_m = cv2.getRotationMatrix2D(center, angle, 1.0)

    cos_val = abs(rot_m[0, 0])
    sin_val = abs(rot_m[0, 1])
    new_w = int(h * sin_val + w * cos_val)
    new_h = int(h * cos_val + w * sin_val)

    rot_m[0, 2] += (new_w / 2) - center[0]
    rot_m[1, 2] += (new_h / 2) - center[1]

    rotated = cv2.warpAffine(img, rot_m, (new_w, new_h))
    out_path = "images/temp/rotated_texture.png"
    cv2.imwrite(out_path, rotated)
    return out_path


def update_mesh(index: int):
    """
    Loads the experiment at index, updates the 3D wave plane
    and draws line/square on the correct image. Then updates the texture.
    """
    Path("images/temp").mkdir(parents=True, exist_ok=True)
    exps = Experiment.load_all()
    if index < 0 or index >= len(exps):
        print(f"Invalid index: {index}")
        return

    exp = exps[index]

    # Remove old text
    plotter.remove_actor("experiment_text")

    # Load the relevant image
    image_path = os.path.join(IMAGES_FOLDER, exp.filename)
    img = cv2.imread(image_path)
    if img is None:
        print(f"[update_mesh] Could not load image: {image_path}")
        return

    height, width = img.shape[:2]

    # Draw line or square
    if exp.square_position:
        draw_square_on_image(img, exp, width, height)
    elif exp.line_center_coordinates:
        draw_line_on_image(img, exp, width, height)

    # Save the modified image
    cv2.imwrite(TEMP_TEXTURE, img)

    # Optionally rotate
    rotated_path = rotate_texture(TEMP_TEXTURE, ROTATION_ANGLE)

    # Create or update the plane geometry based on wave
    new_points = create_sinusoidal_plane_mesh(
        size=2.0,
        wave_amplitude=exp.wave_amplitude,
        wave_frequency=exp.wave_frequency
    ).points
    plane.points = new_points

    # Load final texture
    new_tex = pv.read_texture(rotated_path)

    # Update the mesh
    plotter.add_mesh(plane, texture=new_tex, show_edges=False, opacity=1)

    # Add experiment text
    update_experiment_text(exp)

    plotter.render()


# ----------------------------
#   CALLBACKS
# ----------------------------

experiment_counter = 0
scenario_index = 0
new_subfolder: Path = None

def goback_callback():
    global experiment_counter, scenario_index
    show_key_popup('z')
    if experiment_counter > 0:
        experiment_counter -= 1
    update_mesh(experiment_counter)
    write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1

def success_callback():
    global experiment_counter, scenario_index
    show_key_popup('Right')
    record_experiment_result(True, experiment_counter)
    experiment_counter += 1
    update_mesh(experiment_counter)
    write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1

def fail_callback():
    global experiment_counter, scenario_index
    show_key_popup('Left')
    record_experiment_result(False, experiment_counter)
    experiment_counter += 1
    update_mesh(experiment_counter)
    write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1

# ----------------------------
#   MAIN
# ----------------------------
if __name__ == "__main__":

    # 1) Ensure the top-level folder exists
    base_path = Path(EXPERIMENT_FOLDER)
    base_path.mkdir(exist_ok=True, parents=True)

    # 2) Create or resume scenario
    old_sub = get_most_recent_experiment_subfolder(base_path)
    print(f"[INFO] Old subfolder: {old_sub}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_subfolder = base_path / f"experiment_{timestamp}"
    new_subfolder.mkdir(exist_ok=True)

    # If there's an old subfolder, copy its CSVs into the new one
    if old_sub and old_sub.is_dir():
        for csv_file in old_sub.glob("*.csv"):
            dst = new_subfolder / csv_file.name
            shutil.copyfile(csv_file, dst)

    # 3) Find the highest scenario in the new subfolder
    sc_csv, sc_index = find_highest_scenario_csv(new_subfolder)
    if sc_csv:
        print(f"[RESUME] Found scenario file: {sc_csv}")
        Experiment.CSV_FILE = str(sc_csv)
        scenario_index = sc_index + 1
    else:
        print("[RESUME] No scenario CSV found in new folder, using template.")
        Experiment.CSV_FILE = TEMPLATE_CSV
        scenario_index = 0

    # 4) Load experiments from CSV
    Experiment._cached_experiments = None
    exps = Experiment.load_all()
    if not exps:
        print("No experiments in the CSV file. Exiting.")
        exit()

    # 5) Find the first incomplete
    experiment_counter = find_first_incomplete_index()
    if experiment_counter >= len(exps):
        print("All experiments are completed. Exiting.")
        exit()

    first_exp = exps[experiment_counter]

    # 6) Create the initial plane with wave settings from the first experiment
    plane = create_sinusoidal_plane_mesh(
        size=2.0,
        wave_amplitude=first_exp.wave_amplitude,
        wave_frequency=first_exp.wave_frequency
    )
    plotter.add_mesh(plane, show_edges=False, opacity=1)

    # 7) Key events
    plotter.add_key_event("z", goback_callback)
    plotter.add_key_event("Right", success_callback)
    plotter.add_key_event("Left", fail_callback)

    # 8) Show the first incomplete experiment
    update_mesh(experiment_counter)
    write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1

    # 9) Start interactive session
    plotter.show(title="Interactive Multi-Image Experiment with Pre-Calculated Positions")
