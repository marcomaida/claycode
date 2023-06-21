import tree.tree 
from tree.tree import TreeNode

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


def tree_ord(node):
    needs_ord = not all([tree.tree.equal(node.children[i-1], node.children[i]) 
                         for i in range(1,len(node.children))])
    
    for c in node.children:
        tree_ord(c)

    if needs_ord:
        node.children = [tree.tree.wrap(node.children[i], i) 
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