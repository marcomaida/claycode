# MIT License with Commons Clause
# Copyright (c) 2025 Claycode
# See LICENSE file in the root of this project for license details.
# Commercial use is prohibited without a separate license.

from text_bit.bit_string import BitString

"""
Encoding specialised in encoding natural numbers `[ 1, 2, 3, 4, 5, ... ]`
Represents the number in binary. 
Does NOT allow trailing zeros. 
Does NOT encode zero. 
"""
class NatNumberEncoding: 
    def text_to_bit(text):
        if (text[0] == '0' # We do not allow trailing zeroes
            or any((t not in "0123456789" for t in text))):
            return None
        else:
            return BitString(f"{int(text):b}")
        
    def bit_to_text(bit_string):
        return str(int(bit_string))
    
