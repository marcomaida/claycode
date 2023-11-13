from tree_lib.tree import TreeNode
from tree_lib.util import bit_string_to_number, number_to_bit_string

######################
# Unordered tree encoding
# Treats the bits as a big natural number
# Decompose the number into 2^a + 2^b + 2^c + ...
# This happens until the base of the recursion (1) is reached
# 
# This encoding is unordered as the exponents will be monotonically
# decreasing
######################

# Returns the largest power of `b` contained in `n`
def largest_pow(n,b):
    assert b > 1
    assert n >= 1
    max_exp = 0
    val = 1
    while val*b <= n:
        max_exp+=1
        val*=b
            
    return max_exp

def number_to_pow_decomposition(n):
    dec = []
    while n > 0:
        lp = largest_pow(n, 2)
        dec += [lp]
        n-=2**lp
    return dec

def pow_decomposition_to_number(dec):
    dec.sort(reverse=True)
    return sum([2**pow for i,pow in enumerate(dec)])

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_pow_decomposition(n)
        root.children = [TreeNode() for _ in range(len(dec))]
        for i,c in enumerate(root.children):
            populate_tree_of_number(c, dec[i])

    root = TreeNode()
    n = bit_string_to_number(bits)
    populate_tree_of_number(root, n)

    root.initialize()
    return root

def tree_to_bits(root: TreeNode) -> str:
    def tree_to_number(root: TreeNode):
        if root.children == []:
            return 0
        else:
            dec = [tree_to_number(c) for c in root.children]
            dec.sort(reverse=True)
            return pow_decomposition_to_number(dec)
        
    return number_to_bit_string(tree_to_number(root))