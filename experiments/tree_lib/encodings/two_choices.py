from tree_lib.tree import TreeNode, equal, wrap
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
######################

def bits_to_tree(stream): 
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
            bits += "0" if len(children) == 2 else "1"
            for c in children:
                frontier.append(c)

    
    

def bits_to_tree_k(stream, k): 
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

def tree_ord(node):
    needs_ord = not all([equal(node.children[i-1], node.children[i]) 
                         for i in range(1,len(node.children))])
    
    for c in node.children:
        tree_ord(c)

    if needs_ord:
        node.children = [wrap(node.children[i], i) 
                         for i in range(len(node.children))]

# A modified version of the encoding that marks
# the order of branches by nesting stacks of
# one children when necessary
def bits_to_tree_ord(stream):
    t = bits_to_tree(stream)
    num_descendants_opt = t.n_descendants
    tree_ord(t)
    t.initialize()
    assert(t.n_descendants >= num_descendants_opt)
    return t