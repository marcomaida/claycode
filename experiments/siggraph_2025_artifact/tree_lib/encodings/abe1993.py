from tree_lib.util import bit_string_to_number, number_to_bit_string, largest_fib, fib
from tree_lib.tree import TreeNode

from sympy.ntheory import factorint
from sympy.functions.combinatorial.numbers import primepi
from sympy import prime

"""
Based on "Tree Representation of Positive Integer, Y.Abe, 1993
"""

def bits_to_tree(bits: str) -> TreeNode: 
    def nat_to_tree(n):
        """
        Builds the rooted tree representation for a positive integer n.
        """
        if n == 1:
            # Base case: T(1) is a single node
            return TreeNode([])

        factors = factorint(n)
        if len(factors) == 1 and list(factors.values())[0] == 1:
            # Case for prime numbers: wrap the tree of its rank with one additional root
            rank = primepi(n)
            return TreeNode([nat_to_tree(rank)])
        
        # Case for composite numbers: amalgamation of the trees of its factors
        root = TreeNode([])
        for factor, power in factors.items():
            for _ in range(power):
                root.children.append(nat_to_tree(primepi(factor)))
        return root
        
    
    n = bit_string_to_number(bits)
    result = nat_to_tree(n)
    result.initialize()
    return result

def tree_to_bits(root: TreeNode) -> str:
    def tree_to_nat(tree: TreeNode):
        """
        Converts a tree representation back to its corresponding number.
        """
        if not tree.children:
            # Base case: single node corresponds to 1
            return 1

        # Amalgamated tree corresponds to a composite number
        number = 1
        for child in tree.children:
            number *= prime(tree_to_nat(child))
        return number
    
    return number_to_bit_string(tree_to_nat(root))
