
from tree_lib.util import bit_string_to_number, number_to_bit_string
from tree_lib.tree import TreeNode

######################
# Unordered tree encoding
# Decompose the number into (a^2 + b^2 + c^2) + 1 ...
######################

# Returns the largest square contained in `n`
def largest_square(n):
    if n == 1:
        return 1

    a = 0
    b = n
    while True:
        r = a + (b-a)//2
        rsq = r*r
        if rsq <= n and (r+1)**2 > n:
            return r
        else:
            if rsq <= n:
                a = r
            else:
                b = r

def number_to_square_decomposition(n):
    dec = []
    n-=1
    while n > 0:
        lsq = largest_square(n)
        dec += [lsq]
        n-=lsq**2
    return dec

def square_decomposition_to_number(dec):
    return sum([(num**2) for num in dec])+1

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_square_decomposition(n)
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
            return square_decomposition_to_number(dec)
    
    return number_to_bit_string(tree_to_number(root))