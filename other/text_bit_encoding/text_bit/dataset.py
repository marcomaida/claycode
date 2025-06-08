# MIT License with Commons Clause
# Copyright (c) 2025 Claycode
# See LICENSE file in the root of this project for license details.
# Commercial use is prohibited without a separate license.

import glob, os

""" 
Read all datasets under the given path, loads them in a dictionary 
"""
def read_datasets(path):
    datasets = {}
    for f in glob.glob(path+"*"):
        basename = os.path.basename(f)
        assert basename.endswith(".md"), "Not all files are .md"
        name = basename[:-3] # remove .md
        datasets[name] = Dataset(name, f)

    return datasets

class Dataset:
    def __init__(self, name, dataset_path):
        self.name = name
        with open(dataset_path) as f:
            stripped = (l.replace("\n", "") for l in f)
            without_comments = (l for l in stripped if len(l) > 0 and not l[0] == '#')
            self.test_cases = [l for l in without_comments]

    def __iter__(self):
        return (s for s in self.test_cases)
