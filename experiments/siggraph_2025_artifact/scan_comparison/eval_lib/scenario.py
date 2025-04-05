import cv2, math
from pathlib import Path
from .experiment import Experiment
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