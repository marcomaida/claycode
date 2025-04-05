
from tree_lib.util import bit_string_to_number, number_to_bit_string
from tree_lib.tree import TreeNode

######################
# Unordered tree encoding
# Decompose the number into (a^3 + b^3 + c^3) + 1 ...
######################

# Returns the largest cube contained in `n`
def largest_cube(n):
    if n == 1:
        return 1

    a = 0
    b = n
    while True:
        r = (a+b)//2
        rsq = r**3
        if rsq <= n and (r+1)**3 > n:
            return r
        else:
            if rsq <= n:
                a = r
            else:
                b = r

def number_to_cube_decomposition(n):
    dec = []
    n-=1
    while n > 0:
        lsq = largest_cube(n)
        dec += [lsq]
        n-=lsq**3
    return dec

def cube_decomposition_to_number(dec):
    dec.sort(reverse=True)
    return sum([(num**3) for num in dec])+1

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_cube_decomposition(n)
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
            return 1
        else:
            dec = [tree_to_number(c) for c in root.children]
            dec.sort(reverse=True)
            return cube_decomposition_to_number(dec)
    
    return number_to_bit_string(tree_to_number(root))