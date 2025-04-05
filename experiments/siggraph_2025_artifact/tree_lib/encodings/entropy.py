
from tree_lib.util import bit_string_to_number, number_to_bit_string
from tree_lib.tree import TreeNode

######################
# Unordered tree encoding
# Decompose the number into ((a+1)//2 + (b+1)//2 + (c+1)//2) ...
######################

def number_to_div2_decomposition(n):
    dec = []
    n-=1
    while n > 0:
        div2 = (n+1) // 2
        dec += [div2]
        n-=(div2*2)-1
    return dec

def div2_decomposition_to_number(dec):
    dec.sort(reverse=True)
    return sum([(num*2)-1 for num in dec])+1

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_div2_decomposition(n)
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
            return div2_decomposition_to_number(dec)
    
    return number_to_bit_string(tree_to_number(root))