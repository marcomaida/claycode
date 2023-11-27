from tree_lib.util import bit_string_to_number, number_to_bit_string, gauss, largest_gauss_binsearch
from tree_lib.tree import TreeNode

######################
# Unordered tree encoding
# Cantor 2D Encoding
######################

# returns the minimum k for which (k*(k+1))/2 >= n
# i.e., left bottom point of the diagonal n is in
def geq_gauss(n):
    lg = largest_gauss_binsearch(n)
    return lg if gauss(lg) == n else lg+1

def cantor2d_bisect(n):
    if n == 0:
        return []
    
    g = geq_gauss(n)
    gg = gauss(g)
    return [g-1, g-gg+n-1]

def cantor2d_bisect_inverse(c):
    if c == []:
        return 0
    
    x, y = [a+1 for a in c] # add +1 to both coordinates
    gg = gauss(x)
    n = y-x+gg
    return n

def number_to_cantor2d_decomposition(n):
    if n == 0:
        return []
    
    assert n > 0
    dec = cantor2d_bisect(n)
    return dec

def cantor2d_decomposition_to_number(dec):
    if dec == []:
        return 0
    
    dec.sort(reverse=True)
    return cantor2d_bisect_inverse(dec)

def bits_to_tree(bits: str) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_cantor2d_decomposition(n)
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
            return cantor2d_decomposition_to_number(dec)
        
    return number_to_bit_string(tree_to_number(root))
