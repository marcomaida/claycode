import cv2
import pyvista as pv
import numpy as np
import time
import os
import math
import shutil
from datetime import datetime
from pathlib import Path
from eval_lib.experiment import Experiment
import eval_lib.scenario as scenario

# ----------------------------
#   GLOBAL SETTINGS
# ----------------------------

MAX_ANIMATION_STEPS = 500 # Defines how long the zoom animation should last.
BASELINE_ZOOM = 1.0 # Initial zoom factor for plotter

# The top-level folder holding the template plus scenario subfolders.
# Example: "results/testing-scenario"
EXPERIMENT_FOLDER = "results/testing-scenario"

# The base CSV file (e.g., "template.csv") inside that folder
TEMPLATE_CSV = os.path.join(EXPERIMENT_FOLDER, "template.csv")

# The location of images we reference in the CSV (filename column).
# e.g., "images/testing-scenario"
IMAGES_FOLDER = "images/testing-scenario"

# Temporary location for modified textures
TEMP_TEXTURE = "images/temp/modified_texture.png"

CAMERA_POSITION = [(0, 0, 30), (0, 0, 0), (0, 1, 0)]

current_actor = None

# ----------------------------
#   PYVISTA / PLOTTING
# ----------------------------

plotter = pv.Plotter()
plotter.add_background_image("images/landscape.jpg", 1.2)  # Optional
plotter.enable_lightkit()

current_zoom = 1.0
def set_zoom(step):
    global current_zoom
    val = 1. + 0.3 * math.sin(2 * math.pi * step / MAX_ANIMATION_STEPS)
    plotter.camera.zoom(val/current_zoom)
    current_zoom = val

#plotter.show_axes()

def create_sinusoidal_plane_mesh(wave_amplitude, wave_frequency, grid_size=10, resolution=100):
    """
    Create a sinusoidal plane mesh with texture coordinates using PyVista.

    Parameters:
        wave_amplitude (float): Amplitude of the sine wave.
        wave_frequency (float): Frequency of the sine wave.
        grid_size (float): Size of the grid (extent of the plane).
        resolution (int): Number of points along one dimension.

    Returns:
        pyvista.StructuredGrid: A PyVista mesh of the sinusoidal plane with texture coordinates.
    """
    # Create a uniform grid in the x-y plane
    x = np.linspace(-grid_size / 2, grid_size / 2, resolution)
    y = np.linspace(-grid_size / 2, grid_size / 2, resolution)
    x, y = np.meshgrid(x, y)

    # Apply sinusoidal transformation to the z-coordinates
    z = wave_amplitude * np.sin(wave_frequency * x) * np.cos(wave_frequency * y)

    # Create a structured grid
    grid = pv.StructuredGrid()
    grid.points = np.c_[x.ravel(), y.ravel(), z.ravel()]
    grid.dimensions = (resolution, resolution, 1)

    # Create texture coordinates
    u = (x - x.min()) / (x.max() - x.min())  # Normalize x to [0, 1]
    v = (y - y.min()) / (y.max() - y.min())  # Normalize y to [0, 1]
    uv_coords = np.c_[u.ravel(), v.ravel()]  # Combine u and v into a single array

    # Add texture coordinates as a NumPy array
    grid.point_data["Texture Coordinates"] = uv_coords

    # Set active texture coordinates
    grid.active_t_coords = grid.point_data["Texture Coordinates"]

    return grid

def show_key_popup(key: str):
    if key == 'z':
        txt = "PREVIOUS"
    elif key == 'Right':
        txt = "ACCEPTED"
    elif key == 'Left':
        txt = "REJECTED"
    elif key == 'space':
        txt = "ANIMATE"
    else:
        txt = f"KEY: {key}"

    plotter.add_text(txt, position="lower_left",
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
        f"Rotation: {exp.rotation}\n"
    )
    plotter.add_text(txt, position="upper_left", font_size=15,
                     color="white", shadow=False, name="experiment_text")

def record_experiment_result(outcome: bool, index: int):
    exps = Experiment.load_all()
    if 0 <= index < len(exps):
        exps[index].edit(successful=outcome)

def update_mesh(index: int):
    """
    Loads the experiment at index, updates the 3D wave plane
    and draws square on the correct image. Then updates the texture.
    """
    global current_actor
    if current_actor is not None:
        plotter.remove_actor(current_actor)
        current_actor = None

    Path("images/temp").mkdir(parents=True, exist_ok=True)
    exps = Experiment.load_all()
    if index < 0 or index >= len(exps):
        print(f"Invalid index: {index}")
        return

    exp = exps[index]

    plotter.camera_position = CAMERA_POSITION
    plotter.camera_set = False  

    # Remove old text
    plotter.remove_actor("experiment_text")

    # Load the relevant image
    image_path = os.path.join(IMAGES_FOLDER, exp.filename)
    img = cv2.imread(image_path)
    if img is None:
        print(f"[update_mesh] Could not load image: {image_path}")
        return

    height, width = img.shape[:2]

    # Check if it's needed to create a square
    if exp.square_position:
        scenario.draw_square_on_image(img, exp, width, height)

    # Save the modified image
    cv2.imwrite(TEMP_TEXTURE, img)

    # Create or update the plane geometry based on wave
    assert current_actor is None, "Current actor was not deleted"
    plane = create_sinusoidal_plane_mesh(
        wave_amplitude=exp.wave_amplitude,
        wave_frequency=exp.wave_frequency
    )
    plane.rotate_x(exp.rotation[0], inplace=True)
    plane.rotate_y(exp.rotation[1], inplace=True)

    # Load final texture
    new_tex = pv.read_texture(TEMP_TEXTURE)
    # Update the mesh
    plotter.suppress_rendering = True  # Needed to avoid flickering
    current_actor = plotter.add_mesh(plane, texture=new_tex, ambient=0.6, show_edges=False, opacity=1)
    plotter.camera_position = CAMERA_POSITION
    plotter.suppress_rendering = False

    # Add experiment text
    update_experiment_text(exp)


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
    scenario.write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1

def success_callback():
    global experiment_counter, scenario_index
    show_key_popup('Right')
    record_experiment_result(True, experiment_counter)
    experiment_counter += 1
    update_mesh(experiment_counter)
    scenario.write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1

def fail_callback():
    global experiment_counter, scenario_index
    show_key_popup('Left')
    record_experiment_result(False, experiment_counter)
    experiment_counter += 1
    update_mesh(experiment_counter)
    scenario.write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1
    
def start_animation_callback():
    show_key_popup('space')
    plotter.add_timer_event(max_steps=MAX_ANIMATION_STEPS, duration=0, callback=set_zoom)


# ----------------------------
#   MAIN
# ----------------------------
if __name__ == "__main__":
    # 1) Ensure the top-level folder exists
    base_path = Path(EXPERIMENT_FOLDER)
    base_path.mkdir(exist_ok=True, parents=True)

    # 2) Create or resume scenario
    old_sub = scenario.get_most_recent_experiment_subfolder(base_path)
    print(f"[INFO] Old subfolder: {old_sub}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_subfolder = base_path / f"experiment_{timestamp}"
    new_subfolder.mkdir(exist_ok=True)
    update_mesh(0) # Runs the update_mesh without displaying it just to setup the environment properly
    
    # If there's an old subfolder, copy its CSVs into the new one
    if old_sub and old_sub.is_dir():
        for csv_file in old_sub.glob("*.csv"):
            dst = new_subfolder / csv_file.name
            shutil.copyfile(csv_file, dst)

    # 3) Find the highest scenario in the new subfolder (we resume the experiment from the latest CSV file, so that we can resume interrupted experiments)
    sc_csv, sc_index = scenario.find_highest_scenario_csv(new_subfolder)
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
    experiment_counter = scenario.find_first_incomplete_index()
    if experiment_counter >= len(exps):
        print("All experiments are completed. Exiting.")
        exit()

    first_exp = exps[experiment_counter]

    # 6) Key events
    plotter.add_key_event("z", goback_callback)
    plotter.add_key_event("Right", success_callback)
    plotter.add_key_event("Left", fail_callback)
    plotter.add_key_event("space", start_animation_callback)

    # 7) Show the first incomplete experiment
    update_mesh(experiment_counter)
    scenario.write_scenario_csv(scenario_index, new_subfolder)
    scenario_index += 1

    # 8) Start interactive session
    plotter.show(title="Interactive Multi-Image Experiment with Pre-Calculated Positions")
