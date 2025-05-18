# MIT License with Commons Clause
# Copyright (c) 2025 Claycode
# See LICENSE file in the root of this project for license details.
# Commercial use is prohibited without a separate license.

"""
A bit string, only accepting 0 and 1 as valid characters
"""
class BitString:
    def __init__(self, value: str):
        self.validate(value)  # Validate the input string
        self.value = value

    @staticmethod
    def validate(value: str):
        if not all(c in "01" for c in value):
            raise ValueError("String must contain only '0' and '1' characters.")

    def __add__(self, other):
        if isinstance(other, BitString):
            return BitString(self.value + other.value)
        elif isinstance(other, str):
            return BitString(self.value + other)
        else:
            return NotImplemented

    def __eq__(self, other):
        if isinstance(other, BitString):
            return self.value == other.value
        elif isinstance(other, str):
            return self.value == other
        else:
            return NotImplemented

    # Mirror string type
    def __str__(self): return self.value
    def __repr__(self): return self.value
    def __int__(self): return int(self.value, base=2)
    def __len__(self): return len(self.value)
    def __getitem__(self, key): return BitString(self.value[key])
    def __hash__(self): return hash(self.value)