from tree_lib.tree import TreeNode, equal, wrap
from tree_lib.bit_stream import bit_stream_literal

######################
# Simple encoding
######################

def bits_to_tree(bits: str) -> TreeNode: 
    root = TreeNode()
    q = [root]
    i = 0
    bits += "1"

    while q and i < len(bits):
        assert bits[i] in {"1", "0"}
        assert q

        curr_node = q.pop()

        if bits[i] == "0":
            if not q:
                curr_node.children = [TreeNode()]
            i += 1
        elif bits[i] == "1":
            new_children = [TreeNode()]
            while i < len(bits) and bits[i] == "1":
                new_children.append(TreeNode())
                i += 1
            curr_node.children = new_children

        for child in curr_node.children:
            q.insert(0, child)

    root.initialize()
    return root

def tree_to_bits(root: TreeNode) -> str:
    bits = ""
    q = [root]

    while q:
        curr_node = q.pop()

        if len(curr_node.children) <= 1:
            bits += "0"
        else:
            bits += "1"*(len(curr_node.children)-1)

        for child in curr_node.children:
            q.insert(0, child)
    
    # Strip last trailing zeroes and one terminator
    bits = bits.rstrip('0')[:-1]
    return bits
