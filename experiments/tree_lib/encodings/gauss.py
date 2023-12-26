from tree_lib.util import bit_string_to_number, number_to_bit_string, largest_gauss_binsearch
from tree_lib.tree import TreeNode

######################
# Unordered tree encoding
# Gauss Encoding
######################

def gauss(n):
    return (n*(n+1))//2

def number_to_gauss_decomposition(n):
    assert n > 0
    dec = []
    n-=1
    while n > 0:
        lgauss = largest_gauss_binsearch(n)
        dec += [lgauss]
        n-=gauss(lgauss)
    return dec

def gauss_decomposition_to_number(dec):
    dec.sort(reverse=True)
    return sum([gauss(num) for num in dec]) + 1

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_gauss_decomposition(n)
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
            return gauss_decomposition_to_number(dec)
        
    return number_to_bit_string(tree_to_number(root))
