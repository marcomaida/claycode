# experiment.py
import csv
import os
import ast

class Experiment:
    # By default, we assume your folder is "results/testing-scenario/template.csv".
    CSV_FILE = "results/testing-scenario/template.csv"
    _cached_experiments = None

    def __init__(self, experiment_id, successful, wave_amplitude=0.1, wave_frequency=0.2,
                 square_position=None, square_dimension_perc=0.0, rotation=[0,0], filename=None):
        self.experiment_id = int(experiment_id)
        self.successful = successful
        self.wave_amplitude = float(wave_amplitude)
        self.wave_frequency = float(wave_frequency)
        self.square_position = square_position
        self.square_dimension_perc = float(square_dimension_perc)
        self.rotation = rotation
        self.filename = filename

    @staticmethod
    def from_dict(data):
        def safe_literal_eval(value):
            try:
                return tuple(ast.literal_eval(value)) if value not in ('None', None, '') else None
            except (ValueError, SyntaxError):
                return None

        return Experiment(
            experiment_id=int(data["experiment_id"]),
            successful=None if data["successful"] in ("None", "") else data["successful"],
            wave_amplitude=float(data["wave_amplitude"]),
            wave_frequency=float(data["wave_frequency"]),
            square_position=safe_literal_eval(data["square_position"]),
            square_dimension_perc=float(data["square_dimension_perc"]),
            rotation=safe_literal_eval(data["rotation"]),
            filename=data.get("filename", None)
        )

    def to_dict(self):
        return {
            "experiment_id": self.experiment_id,
            "successful": self.successful,
            "wave_amplitude": self.wave_amplitude,
            "wave_frequency": self.wave_frequency,
            "square_position": self.square_position,
            "square_dimension_perc": self.square_dimension_perc,
            "rotation": self.rotation,
            "filename": self.filename
        }

    @classmethod
    def load_all(cls):
        if cls._cached_experiments is None:
            if not os.path.exists(cls.CSV_FILE):
                cls._cached_experiments = []
            else:
                with open(cls.CSV_FILE, mode="r", newline="") as file:
                    reader = csv.DictReader(file)
                    cls._cached_experiments = [cls.from_dict(row) for row in reader]
        return cls._cached_experiments

    @classmethod
    def write_all(cls, csv_path=None):
        if cls._cached_experiments is None:
            return

        target_path = csv_path if csv_path else cls.CSV_FILE
        folder = os.path.dirname(target_path)
        if folder and not os.path.exists(folder):
            os.makedirs(folder, exist_ok=True)

        with open(target_path, mode="w", newline="") as file:
            if not cls._cached_experiments:
                fieldnames = [
                    "experiment_id", "successful", "wave_amplitude", "wave_frequency",
                    "square_position", "square_dimension_perc", "rotation","filename"
                ]
                writer = csv.DictWriter(file, fieldnames=fieldnames)
                writer.writeheader()
            else:
                # Use the keys of the first experiment to define columns
                writer = csv.DictWriter(
                    file,
                    fieldnames=cls._cached_experiments[0].to_dict().keys()
                )
                writer.writeheader()
                for exp in cls._cached_experiments:
                    writer.writerow(exp.to_dict())

    def save(self):
        experiments = self.load_all()
        updated = False
        for i, e in enumerate(experiments):
            # Match by (experiment_id, filename) if we want them unique combos
            if e.experiment_id == self.experiment_id and e.filename == self.filename:
                experiments[i] = self
                updated = True
                break
        if not updated:
            experiments.append(self)

    def delete(self):
        experiments = self.load_all()
        for i, e in enumerate(experiments):
            if e.experiment_id == self.experiment_id and e.filename == self.filename:
                del experiments[i]
                break

    def edit(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.save()

    @staticmethod
    def load(experiment_id, filename=None):
        """
        If filename is provided, we look for that combination.
        If not, we look by experiment_id alone (which might be ambiguous).
        """
        experiments = Experiment.load_all()
        for e in experiments:
            if filename:
                if e.experiment_id == experiment_id and e.filename == filename:
                    return e
            else:
                if e.experiment_id == experiment_id:
                    return e
        return None
