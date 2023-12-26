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

def cantor2d_bisect(n, snake=False):
    if n == 0:
        return []
    
    g = geq_gauss(n)
    gg = gauss(g)

    # Note: n <= gg
    if snake and (g-1)%2 == 1:
        return [g-1, gg-n]  # [g-1, 0]   when gg == n
    return [g-1, g-1 +n-gg] # [g-1, g-1] when gg == n

def cantor2d_bisect_inverse(c, snake=False):
    if c == []:
        return 0
    
    x, y = [a+1 for a in c] # add +1 to both coordinates
    gg = gauss(x)

    # Note: y <= x
    if snake and (x-1)%2 == 1:
        return gg-y+1   # gauss(x) when croissant(y) == 0
    return gg -x+y      # gauss(x) when x == y

def number_to_cantor2d_decomposition(n, snake):
    if n == 0:
        return []
    
    assert n > 0
    dec = cantor2d_bisect(n, snake)
    dec = [d for d in dec if d != 0]

    return dec

def cantor2d_decomposition_to_number(dec, snake):
    if len(dec) != 2:
        dec += [0 for _ in range(2-len(dec))]
    
    dec.sort(reverse=True)
    return cantor2d_bisect_inverse(dec, snake)

def bits_to_tree(bits: str, snake=False) -> TreeNode: 
    def populate_tree_of_number(root: TreeNode, n):
        dec = number_to_cantor2d_decomposition(n, snake)
        root.children = [TreeNode() for _ in range(len(dec))]
        for i,c in enumerate(root.children):
            populate_tree_of_number(c, dec[i])

    root = TreeNode()
    n = bit_string_to_number(bits)
    populate_tree_of_number(root, n)

    root.initialize()
    return root

def tree_to_bits(root: TreeNode, snake=False) -> str:
    def tree_to_number(root: TreeNode):
        if root.children == []:
            return 1
        else:
            dec = [tree_to_number(c) for c in root.children]
            dec.sort(reverse=True)
            return cantor2d_decomposition_to_number(dec, snake)
        
    return number_to_bit_string(tree_to_number(root))
