from tree_lib.tree import TreeNode, equal, wrap
from tree_lib.bit_stream import bit_stream_literal
import math

######################
# The original Treecode encoding, modified so that it 
# produces one or two children.
######################

def bits_to_tree(input_string): 
    stream = bit_stream_literal(input_string)
    root = TreeNode()
    frontier = [root]
    while not stream.is_finished():
        bit = stream.next()
        assert bit == 1 or bit == 0
        assert len(frontier) > 0

        father = frontier.pop(0)
        if len(frontier) > 0: # Father can have no children
            if bit == 0: 
                continue # no child
            else: 
                # father will have children, a 1 has been processed
                bit = stream.next()

        children = [TreeNode()]
        if bit == 1: children.append(TreeNode())
        for c in children:
            frontier.append(c)
        father.children = children
    
    root.initialize()
    return root

def tree_to_bits(root):
    bits = ""
    frontier = [root]
    while len(frontier) > 0:
        parent = frontier.pop(0)

        # First choice -- has children?
        if len(frontier) > 0:  # If first choice is available
            bits += "1" if len(parent.children) > 0 else "0"

        # Second choice -- how many children?
        if len(parent.children) > 0:
            assert len(parent.children) in [1,2]
            bits += "0" if len(parent.children) == 1 else "1"
            for c in parent.children:
                frontier.append(c)
    
    # Strip last trailing zeroes and one terminator
    bits = bits.rstrip('0')[:-1]

    return bits
    
    