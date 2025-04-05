from tree_lib.util import bit_string_to_number, number_to_bit_string, largest_fib, fib
from tree_lib.tree import TreeNode

######################
# Unordered tree encoding
# Fibonaccio Encoding
######################

def number_to_fib_decomposition(n):
    dec = []
    while n > 0:
        lfib = largest_fib(n)
        dec += [lfib-1] # Because we remove the first 0,1
        n-=fib(lfib)
    return dec

def fib_decomposition_to_number(dec):
    dec.sort(reverse=True)
    return sum([fib(num+1) for num in dec]) # Because we removed the first 0,1

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_fib_decomposition(n)
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
            return fib_decomposition_to_number(dec)
        
    return number_to_bit_string(tree_to_number(root))
