from tree_lib.tree import TreeNode, equal, wrap, tower
from tree_lib.bit_stream import bit_stream_literal
import math

######################
# The original Treecode encoding
# The encoding works with a breath first visit of the tree
# 1. Initialize frontier with root node
# 2. Pop a node from the frontier
# 3. If the bit is 1 or the frontier is empty, 
#          if next bit is 0 create 2 children, otherwise 3, add to frontier.
#    else  
#          go to step 2.
#
# Note: all strings have a "1" appended. If a next bit needs to be fetched at the
# end of the string, it is assumed to be "0" (i.e. will produce node with 2 children)
######################

def bits_to_tree(input_string): 
    stream = bit_stream_literal(input_string)
    root = TreeNode([])
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

        children = [TreeNode(), TreeNode()]
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
            assert len(parent.children) in [2,3]
            bits += "0" if len(parent.children) == 2 else "1"
            for c in parent.children:
                frontier.append(c)
    
    # Strip last trailing zeroes and one terminator
    bits = bits.rstrip('0')[:-1]

    return bits
    
#####################
# Variants 
#####################

def bits_to_tree_k(input_string, k): 
    stream = bit_stream_literal(input_string)

    assert k >=3
    # k children can encode log2(k-1) bits
    k_bits = math.log2(k-1)
    assert k_bits.is_integer()
    k_bits = int(k_bits)

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

        n_children = 0
        for i in range(k_bits):
            n_children += 2**i*bit
            bit = stream.next()
            
        children = [TreeNode() for _ in range(n_children+1)]

        if bit == 1: children.append(TreeNode())
            
        for c in children:
            frontier.append(c)
        father.children = children
    
    root.initialize()
    return root

# Encode sibling ordering in a tree by wrapping
# the nth child with n intermediate nodes
def add_wraps(node):
    children_need_ord = not all([equal(node.children[i-1], node.children[i]) 
                         for i in range(1,len(node.children))])
    
    for c in node.children:
        add_wraps(c)

    if children_need_ord:
        node.children = [wrap(node.children[i], i) 
                         for i in range(len(node.children))]

def bits_to_tree_wrap(input_string):
    t = bits_to_tree(input_string)
    add_wraps(t)
    t.initialize()
    return t


# Encode sibling ordering in a tree by adding markers
# The nth child will have a marker with n intermediate nodes
def add_markers(node, position_to_mark):
    children_need_ord = not all([equal(node.children[i-1], node.children[i]) 
                         for i in range(1,len(node.children))])
    
    for i,c in enumerate(node.children): 
        position = i if children_need_ord else 0
        add_markers(c, position)

    # Add marker
    if position_to_mark > 0:
        cs = [c for c in node.children]
        cs.append(tower(position_to_mark+1))
        node.children = cs

def bits_to_tree_mark(input_string):
    t = bits_to_tree(input_string)
    add_markers(t,0)
    t.initialize()
    return t
