import { TreeNode } from "./tree_node.js";

export class Tree {
  constructor(root) {
    this.root = root;

    this.maxDepth = 0;

    this.initialize_nodes(this.root, "X", 0);
    this.compute_footprints(1);
    this.compute_depth(0);
  }

  toString() {
    return this.root.toString()
  }

  static fromString(str) {
    let root = TreeNode.fromString(str)
    if (root)
      return new Tree(root)
    else
      return null
  }

  /**
   * Initializes all the attributes of a node. Most of them
   * are helpers (label, num descendants, tree)
   * Including the node itself, i.e., a leaf node has 1 descendant
   */
  initialize_nodes(node, prefix, depth) {
    node.label = prefix;

    node.numDescendants = 1;
    for (const [i, c] of node.children.entries()) {
      c.father = node;
      this.initialize_nodes(c, prefix + i.toString(), depth + 1);
      node.numDescendants += c.numDescendants;
    }

    node.tree = this;

    this.maxDepth = Math.max(this.maxDepth, depth);
  }

  compute_footprints(node_padding) {
    compute_footprints_(this.root, node_padding);
  }

  compute_depth(node_depth) {
    compute_depth_(this.root, node_depth);
  }

  get_total_footprint() {
    let total_fp = 0;
    for (const node of treeIterator(this)) {
      total_fp += node.footprint;
    }
    return total_fp;
  }
}

function compute_footprints_(node, node_padding) {
  let children_footprint = 0;
  for (const c of node.children) {
    compute_footprints_(c, node_padding);
    children_footprint += c.footprint;
  }

  node.footprint = children_footprint + 1;
}

function compute_depth_(node, node_depth) {
  node.depth = node_depth;
  for (const c of node.children) {
    compute_depth_(c, node_depth + 1);
  }
}

export function* treeIterator(tree) {
  var node = tree.root;
  var frontier = [node];

  while (frontier.length > 0) {
    node = frontier.shift();
    frontier.push(...node.children);
    yield node;
  }
}
