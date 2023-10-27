from tree_lib.tree import TreeNode

STARTING_BASE = 2

######################
# Unordered tree encoding
# Treats the bits as a big natural number
# Decompose the number into 2^a + 3^b + 4^c + ...
# This happens until the base of the recursion (1) is reached
# 
# This encoding is unordered as the exponents will be monotonically
# decreasing
######################

def bit_string_to_number(bits: str):
    bits = "1" + bits # Add 1 so that any zero on the left is kept
    return sum(int(c)*(2**i) for i,c in enumerate(bits[::-1]))

def number_to_bit_string(n):
    assert n > 0
    return bin(n)[3:] # remove the 0b, then remove the first one

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

# Decompose the number into 2^a + 3^b + 4^c + ...
def number_to_pow_decomposition(n, starting_base=2):
    dec = []
    base=starting_base
    while n > 0:
        lp = largest_pow(n, base)
        dec += [lp]
        n-=base**lp
        base+=1
    return dec

def pow_decomposition_to_number(dec, starting_base=2):
    dec.sort(reverse=True)
    return sum([(i+starting_base)**pow for i,pow in enumerate(dec)])

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_pow_decomposition(n,STARTING_BASE)
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
            return pow_decomposition_to_number(dec,STARTING_BASE)
        
    return number_to_bit_string(tree_to_number(root))