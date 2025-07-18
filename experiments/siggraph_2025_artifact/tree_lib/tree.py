"""
Data structure of the tree, helper function
"""
class TreeNode:
	def __init__(self, children = []):
		self.children = children 
		self.n_descendants = None
		self.longest_descending_path = None
		self.footprint = None
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

	def _compute_footprint(self):
		self.footprint = 1 + sum([c._compute_footprint() for c in self.children], 0)
		return self.footprint
	
	def initialize(self):
		# compute metadata in each this node and children
		self._compute_descendants()
		self._compute_longest_descending_path()
		self._compute_footprint()
  		# self.footprint = sum ((node.longest_descending_path 
					  		# for node in iterate_tree_depth_first(self)))

	def get_total_footprint(self):
		return sum (node.footprint for node in iterate_tree_depth_first(self))
		
	def __repr__(self) -> str:
		return f"{str(self.children)}"
	
	@staticmethod
	def from_parentheses(s):
		"""
		Parses a string of parentheses and returns the root TreeNode.
		:param s: A string of well-formed parentheses.
		:return: TreeNode representing the tree.
		"""
		if not s:
			raise ValueError("The input string is empty.")
		
		stack = []
		root = None

		for char in s:
			if char == '(':
				# Create a new node
				node = TreeNode([])
				if stack:
					# Add the new node as a child of the last node on the stack
					stack[-1].children.append(node)
				else:
					# If the stack is empty, this is the root
					root = node
				# Push the new node onto the stack
				stack.append(node)
			elif char == ')':
				if not stack:
					raise ValueError(f"The parentheses string is not well-formed: {s}")
				# Pop the current node off the stack
				stack.pop()

		# If the stack is not empty, the string is malformed
		if stack:
			raise ValueError(f"The parentheses string is not well-formed: {s}")
		
		return root
	
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
		return TreeNode([])
	else:
		return TreeNode([TreeNode(), rightmost(layers-1)])

# Creates a tower with n children at each layer
# e.g., for layers=4, k=3
# *---*---*---*
# '-* '-* '-* '-* 
# '-* '-* '-* '-*
def tower(layers, k=1):
	assert layers > 0
	if layers == 1:
		return TreeNode([TreeNode() for _ in range(k)])
	else:
		children = [TreeNode() for _ in range(k-1)]
		children += [tower(layers-1)]
		return TreeNode(children)
	
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
