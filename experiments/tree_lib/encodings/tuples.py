from tree_lib.tree import TreeNode, equal, wrap
from tree_lib.bit_stream import bit_stream_literal
import itertools
from enum import Enum

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
    assert is_int(bits_odd) or is_int(bits_even), f"{bits_odd}, {bits_even}"
    bits = ""
    for odd, even in itertools.zip_longest(bits_odd[::-1], bits_even[::-1]):
        assert odd or even
        even = even if even else "0"
        odd = odd if odd else "0"
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
    assert bits
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
    
    if bits == "0":
        root = None
    elif bits == "1":
        root = TreeNode()
    else:
        root = rec("1" + bits)
    
    if root:
        root.initialize()
    return root

#######################

class SortingPolicy(Enum):
    ODD_LEQ_EVEN = 0
    ODD_GT_EVEN = 1
    ODD_GT_EVEN_EQ_ZERO = 2
    UNSORTED = 3

def get_sorting_order(node: TreeNode) -> SortingPolicy:
    if not node:
        return SortingPolicy.UNSORTED
    if len(node.children) <= 2:
        return SortingPolicy.ODD_LEQ_EVEN
    if len(node.children) == 3:
        return SortingPolicy.ODD_GT_EVEN_EQ_ZERO
    if len(node.children) == 4:
        return SortingPolicy.ODD_GT_EVEN
    raise Exception("Hallooo?!")

# Returns non-marker children and ensures that the node has exactly two children (even null)
def remove_markers_add_empty_children(node: TreeNode) -> list[TreeNode]:
    if not node.children:
        return [None, None]
    
    real_children = []
    if len(node.children) <= 2:
        real_children = node.children
    else:
        # Remove markers by ignoring any two leaves arbitrarily
        leaves_found = 0
        for child in node.children:
            if not child.children and leaves_found < 2:
                leaves_found += 1
                continue
            real_children.append(child)

    # There always has to be two children
    if len(real_children) == 1:
        real_children.append(None)
    assert len(real_children) == 2
    return real_children

def sort(bits_a: str, bits_b: str, order: SortingPolicy) -> tuple[int]:
    a = int_binary_to_int(bits_a)
    b = int_binary_to_int(bits_b)

    if order == SortingPolicy.ODD_LEQ_EVEN:
        sorted = (bits_a, bits_b) if a <= b else (bits_b, bits_a)
    elif order == SortingPolicy.ODD_GT_EVEN:
        sorted = (bits_a, bits_b) if a > b else (bits_b, bits_a)
        assert a != b
        if a > b:
            assert b > 0
        else:
            assert a > 0
    elif order == SortingPolicy.ODD_GT_EVEN_EQ_ZERO:
        sorted = (bits_a, bits_b) if a > b else (bits_b, bits_a)
        if a > b:
            assert b == 0
        else:
            assert a == 0
    else:
        raise Exception("Rotes licht jaaa?")
    
    return sorted

def tree_to_bits(root: TreeNode | None) -> str:
    if not root:
        return "0"
    if len(root.children) == 0:
        return "1"

    # Always returns bits representing an integer
    def tau(node) -> str:
        if not node:
            return "0"
        if not node.children:
            return "1"
            
        order = get_sorting_order(node)
        children = remove_markers_add_empty_children(node)
        
        odd_bits, even_bits = sort(tau(children[0]), tau(children[1]), order)

        int_bits = interleave(odd_bits, even_bits)
        assert is_int(int_bits), int_bits

        return int_bits

    bits = tau(root)

    # Strip initial 1
    assert len(bits) > 1, bits
    assert bits[0] == "1", bits
    bits = bits[1:]

    return bits
