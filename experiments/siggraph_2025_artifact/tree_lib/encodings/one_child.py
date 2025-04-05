from tree_lib.tree import TreeNode

######################
# Do only one child per level.
# Spawn as many children as continuous equal bits. Then, 
# pick one child and recursively go on.
######################

def bits_to_tree(bits: str) -> TreeNode: 
    root = TreeNode()
    root.children = [TreeNode()]

    # Handle initial condition
    if bits[0] == "1":
        current_parent = root
        this_level_encodes_ones = True
    else: 
        assert bits[0] == "0"
        current_parent = root.children[0]
        this_level_encodes_ones = False
        
    for bit in bits:
        assert bit == "0" or bit == "1"
        is_one = bit == "1"
        if is_one == this_level_encodes_ones:
            current_parent.children = [TreeNode() for _ in range(len(current_parent.children)+1)] # need to realloc for some reason
        else:
            this_level_encodes_ones = not this_level_encodes_ones
            current_parent = current_parent.children[0]
            current_parent.children = [TreeNode()]

    root.initialize()
    return root

def tree_to_bits(root: TreeNode) -> str:
    bits = ""

    if len(root.children) == 1:
        current_parent = root.children[0]
        this_level_encodes_ones = False
    else:
        current_parent = root
        this_level_encodes_ones = True

    while current_parent:
        bit = "1" if this_level_encodes_ones else "0"
        bits += bit*(len(current_parent.children))

        next_parents = [node for node in current_parent.children if len(node.children) > 0]
        assert len(next_parents) == 0 or len(next_parents) == 1

        if len(next_parents) == 1:
            current_parent = next_parents[0]
            this_level_encodes_ones = not this_level_encodes_ones
        else:
            current_parent = None  

    if bits[0] == "1": # Extra one in the beginning because of extra initial child
        bits = bits[1:]  
    
    return bits
