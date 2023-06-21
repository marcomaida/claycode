"""
Data structure of the tree, helper function
"""
from util.vector import Vector

class TreeNode:
	def __init__(self, children = [], position = Vector(0,0)):
		self.children = children 
		self.position = position
		self.n_descendants = None
		self.longest_descending_path = None
		self.father_thickness = 1

	def _compute_descendants(self):
		self.n_descendants = sum([c._compute_descendants() 
								  for c in self.children], 
								  0) + 1
		return self.n_descendants
		
	def _compute_longest_descending_path(self):
		self.longest_descending_path = max([c._compute_longest_descending_path() 
							  for c in self.children], default=0) + 1
		return self.longest_descending_path
	
	def initialize(self):
		# compute metadata in each this node and children
		self._compute_descendants()
		self._compute_longest_descending_path()

	def __repr__(self) -> str:
		return f"{str(self.children)}"
	
def full_tree (layers, max_branches):
	assert layers > 0

	if layers == 1:
		return TreeNode([])
	else:
		cs = [full_tree(layers-1, max_branches) for _ in range(max_branches)]
		return TreeNode(cs)

def max_layers(t):
	return 1 + max([max_layers(c) for c in t.children], default=0)

def rightmost(layers):
	assert layers > 0
	if layers == 1:
		return TreeNode()
	else:
		return TreeNode([TreeNode(), rightmost(layers-1)])
	
def one():
	return rightmost(2)

def n_branches(node):
	branches = 0
	for c in node.children:
		branches += 1 + n_branches(c)
	
	return branches

def per_layer_breadth(node, per_layer, layer=0):
	if node is None: return
	else:
		if layer in per_layer:
			per_layer[layer]+= 1
		else:	
			per_layer[layer] = 0
			
		for c in node.children:
			per_layer_breadth(c, per_layer, layer+1)

def iterate_tree_depth_first(node):
	if node is None: return
	else:
		yield node
		for c in node.children:
			for n in iterate_tree_depth_first(c):
				yield n

# Wraps the node in n layers of nodes
def wrap(node, layers):
	for _ in range(layers):
		node = TreeNode([node])
	
	return node

# Check if the two trees are topologically equivalent.
def equal(tree1,tree2):
	frontier = [(tree1, tree2)]

	while len(frontier) > 0:
		n1, n2 = frontier.pop(0)
		
		if (len(n1.children) != len(n2.children)):
			return False
		else:
			frontier.extend(list(zip(n1.children, n2.children)))

	return True
