from tree_lib.util import bit_string_to_number, number_to_bit_string, simplex, largest_arg_fitting
from tree_lib.tree import TreeNode

######################
# Unordered tree encoding
# Simplex Encoding
######################

# Returns the index of the minimum simplex number in k dimensions greater or equal to n
# i.e., returns the simplex in k-1 dimensions in which the nth number falls
def geq_simplex(n,k):
    assert k >= 2 # At least 2 dimensions

    if n == 0:
        return 0

    f = lambda m: simplex(m,k) 
    lv = largest_arg_fitting(f, n, True) # largest value less or equal to n
    return lv if f(lv) == n else lv +1


# Map a number to a K-dimensional array with decreasing coordinates
def number_to_simplex_decomposition(n,K):
    if n == 0:
        return []
    
    dec = [0 for _ in range(K)]
    for k in range(K,1,-1):
        ls = geq_simplex(n,k) - 1
        dec[K-k] = ls
        n -= simplex(ls, k) 
        
    dec[K-1] = n-1

    dec = [d for d in dec if d != 0] # remove all trailing zeros

    return dec

def simplex_decomposition_to_number(dec, k):
    if len(dec) != k:
        dec += [0 for _ in range(k-len(dec))]

    return sum(simplex(n, len(dec)-k) for k, n in enumerate(dec)) +1

def bits_to_tree(bits: str, k) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_simplex_decomposition(n, k)
        root.children = [TreeNode() for _ in range(len(dec))]
        for i,c in enumerate(root.children):
            populate_tree_of_number(c, dec[i])

    root = TreeNode()
    n = bit_string_to_number(bits)
    populate_tree_of_number(root, n)

    root.initialize()
    return root

def tree_to_bits(root: TreeNode, k) -> str:
    def tree_to_number(root: TreeNode):
        if root.children == []:
            return 1
        else:
            dec = [tree_to_number(c) for c in root.children]
            dec.sort(reverse=True)
            return simplex_decomposition_to_number(dec, k)
        
    return number_to_bit_string(tree_to_number(root))
