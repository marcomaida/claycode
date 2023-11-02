from tree_lib.tree import TreeNode, equal, wrap
from tree_lib.bit_stream import bit_stream_literal
import itertools

######################
# Variant of https://luthert.web.illinois.edu/blog/posts/434.html
# with markers added (and other tweaks)
######################

# Returns (odd_bits, even_bits) starting from less significant bit
def de_interleave(bits: str) -> tuple[str, str]:
    return (bits[::-1][::2][::-1], bits[::-1][1::2][::-1])

# Fills with zeroes when the bits don't have the same length
def interleave(bits_odd: str, bits_even: str) -> str:
    assert bits_odd or bits_even
    assert len(bits_odd) >= len(bits_even)
    bits = ""
    for odd, even in itertools.zip_longest(bits_odd[::-1], bits_even[::-1]):
        even = even if even else "0"
        bits = even + odd + bits
    # Edge case
    if bits[0] == "0":
        return bits[1:]
    return bits

def add_markers(node: TreeNode, n: int):
    new_children = list(node.children)
    for _ in range(n):
        marker = TreeNode()
        new_children.append(marker)
    node.children = new_children

# Either MSB is 1 or the entire number is 0
def is_int(bits):
    return bits and bits[0] == "1" or bits == "0"

def cut_leading_zeroes(bits: str) -> str:
    assert bits
    bits_int = bits.lstrip("0")
    if not bits_int:
        bits_int = "0"
    return bits_int

# Assumes bits represents an integer
def int_binary_to_int(bits: str) -> int:
    assert is_int(bits)
    n = 0
    for i, bit in enumerate(bits[::-1]):
        n += (2**i)*int(bit)
    return n

#######################

def bits_to_tree(bits: str) -> TreeNode | None:
    for bit in bits:
        assert bit == "1" or bit == "0"
    
    def rec(bits):
        assert is_int(bits) # Assumes bits represents an integer
        if bits == "0":
            return None
        if bits == "1":
            return TreeNode()
        
        new_node = TreeNode()
        new_children = []
        odd_bits, even_bits = de_interleave(bits)
        odd_bits_int = cut_leading_zeroes(odd_bits)
        even_bits_int = cut_leading_zeroes(even_bits)

        left_child = rec(odd_bits_int)
        right_child = rec(even_bits_int)
        if left_child:
            new_children.append(left_child)
        if right_child:
            new_children.append(right_child)
        new_node.children = new_children

        # Add markers based on int tuple (a, b)
        a = int_binary_to_int(odd_bits_int)
        b = int_binary_to_int(even_bits_int)
        if a > b:
            if b == 0:
                assert len(new_node.children) == 1
            else:
                assert len(new_node.children) == 2 and b > 0
            add_markers(new_node, 2)

        return new_node
    
    bits = "1" + bits
    root = rec(bits)
    if root:
        root.initialize()
    return root
