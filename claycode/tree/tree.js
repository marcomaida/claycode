const SEED_COLLIDER_SEGMENTS = 10

export class Tree {
  constructor(root) {
    this.root = root

    this.mesh = null
    this.seedPosition = null
    this.pixiMesh = null
    this.buffer = null

    this.maxDepth = 0

    this.initialize_nodes(this.root, "X", 0)
  }

  /**
   * Initializes all the attributes of a node. Most of them
   * are helpers (label, num descendants, tree)
   * Including the node itself, i.e., a leaf node has 1 descendant
   */
  initialize_nodes(node, prefix, depth) {
    node.label = prefix
    var num = 1

    for (const [i, c] of node.children.entries()) {
      this.initialize_nodes(c, prefix + i.toString(), depth + 1)
      num += c.numDescendants
    }
    node.numDescendants = num
    node.tree = this

    this.maxDepth = Math.max(this.maxDepth, depth)
  }
}

export function* treeIterator(tree) {
  var node = tree.root
  var frontier = [node]

  while (frontier.length > 0) {
    node = frontier.shift()
    frontier.push(...node.children)
    yield node
  }
}
