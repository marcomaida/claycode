# MIT License with Commons Clause
# Copyright (c) 2025 Claycode
# See LICENSE file in the root of this project for license details.
# Commercial use is prohibited without a separate license.

from text_bit.prefix_code import PrefixCode

"""
Multimodal Encoding
"""
class MultimodalEncoding:
    def __init__(self, name, encoding_tree_def):
        self.name = name
        self.tree = PrefixCode(encoding_tree_def)
        pass

    def text_to_bit(self, text):
        # First, try to compute all possible encodings. Some may not support the string
        results = [ (prefix, encoding.text_to_bit(text)) for prefix, encoding in self.tree]
        # Then, compute the final bit string (prefix + encoded string) for all encodings that support the string
        valid_results = [prefix + bit_string for (prefix, bit_string) in results if bit_string is not None]
        assert len(valid_results) > 0, "No encoding generated a valid result"
        # Finally, return the shortest
        return min(valid_results, key=len)
        
    def bit_to_text(self, bit_string):
        # First, get the right encoding
        msg_start_index, encoding = self.tree.element_from_prefix(bit_string)
        assert encoding is not None, "Invalid string prefix"
        # Then, use the encoding to return the original message. Remove prefix.
        return encoding.bit_to_text(bit_string[msg_start_index:])
