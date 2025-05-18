# MIT License with Commons Clause
# Copyright (c) 2025 Claycode
# See LICENSE file in the root of this project for license details.
# Commercial use is prohibited without a separate license.

from text_bit.bit_string import BitString

"""
A full binary tree used to represent encodings
"""
class PrefixCode:
    def __init__(self, tree_def):
        self.elements_by_prefix = {}
        self.build_tree(tree_def)
        self.tree_def = tree_def

    def __iter__(self):
        return ((prefix, el) for prefix, el in self.elements_by_prefix.items())

    """
    An tree definition is given in the form `[ A ,[ B, C ]]`.
    The definition MUST be a full binary tree (exactly 2 children)
    To leave some prefixes undefined (e.g. for future extensions), use `None`,
    e.g. `[[A,B],[[C,D], None]]`
    """
    def build_tree(self, tree_def):
        def _build_tree(prefix, tree_def):
            if tree_def is None:
                return
            elif isinstance(tree_def, list):
                # def is a list, recursively build
                assert len(tree_def) == 2, "tree def must be a full binary tree"
                _build_tree(prefix+"0", tree_def[0])
                _build_tree(prefix+"1", tree_def[1])
            else: 
                # def is a leaf
                self.elements_by_prefix[prefix] = tree_def
        _build_tree(BitString(""), tree_def)

    """
    Given a bit string, returns the element that corresponds the prefix of the bit string, and the
    index that corresponds to the beginning of the actual message.
    E.g. if the bit string is `101001101010100` and there is an element A matching `100`, the 
    function will return (3, `A`)
    """
    def element_from_prefix(self, bit_string):
        assert len(bit_string) > 0

        message_start_idx = 0
        current_element = self.tree_def
        for bit in bit_string:
            if current_element is None:
                raise Exception("bit string's prefix does not match any valid element")
            if isinstance(current_element, list):
                if bit == "0":
                    current_element = current_element[0]
                else: # "1"
                    current_element = current_element[1]
                message_start_idx += 1
            
            if not isinstance(current_element, list):
                return message_start_idx, current_element



def prefix_code_unit_test():
    prefix_code_unit_test_basic()
    prefix_code_unit_test_single_entry()

def prefix_code_unit_test_basic():
    # Test that the prefix code works as expected
    ht = PrefixCode(['A',[['B','C'],['D',None]]])
    assert ht.elements_by_prefix == {'0': 'A', '100': 'B', '101': 'C', '110': 'D'}

    assert ht.element_from_prefix('0') == (1,'A')
    assert ht.element_from_prefix('100') == (3,'B')
    assert ht.element_from_prefix('101') == (3,'C')
    assert ht.element_from_prefix('110') == (3,'D')

    assert ht.element_from_prefix('01010101') == (1,'A')
    assert ht.element_from_prefix('1001') == (3,'B')
    assert ht.element_from_prefix('10101') == (3,'C')
    assert ht.element_from_prefix('11011') == (3,'D')


def prefix_code_unit_test_single_entry():
    # Test that the prefix code works as expected when there is a single entry
    ht = PrefixCode('A')
    assert ht.elements_by_prefix == {'': 'A'}
    assert ht.element_from_prefix('11011') == (0,'A')

