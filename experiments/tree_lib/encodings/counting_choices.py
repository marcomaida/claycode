from tree_lib.tree import TreeNode, equal, wrap
import math

######################
# Experimental encoding
######################

def bits_to_tree(bits: str) -> TreeNode: 
    root = TreeNode()
    q = [root]
    i = 0

    while q and i < len(bits):
        curr_node = q.pop()

        if bits[i] == "0":
            curr_node.children = [TreeNode()]
            i += 1
        elif bits[i] == "1":
            new_children = [TreeNode()]
            while i < len(bits) and bits[i] == "1":
                new_children.append(TreeNode())
                i += 1
            curr_node.children = new_children
        else:
            raise Exception("Halloooo?")
        
        for child in curr_node.children:
            q.insert(0, child)

    # Ignore remaining leaves in queue
    root.initialize()
    return root

def tree_to_bits(root: TreeNode) -> str:
    bits = ""
    q = [root]

    while q:
        curr_node = q.pop()

        # Ignore leaves
        if len(curr_node.children) == 1:
            bits += "0"
        elif len(curr_node.children) > 1:
            bits += "1"*(len(curr_node.children)-1)

        for child in curr_node.children:
            q.insert(0, child)
    
    return bits
