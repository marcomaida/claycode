import { TreeNode } from "./tree_node.js";

export class Tree {
  constructor(root) {
    this.root = root;

    this.maxDepth = 0;

    this.initialize_nodes(this.root, "X", 0);
    this.compute_weights(1);
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

  compute_weights(node_padding) {
    compute_weights_(this.root, node_padding);
  }

  compute_depth(node_depth) {
    compute_depth_(this.root, node_depth);
  }
}

function compute_weights_(node, node_padding) {
  let children_weight = 0;
  for (const c of node.children) {
    compute_weights_(c, node_padding);
    children_weight += c.weight;
  }

  /* 
     WEIGHT HEURISTIC
     This heuristic tries to approximate how much space a node 
     will take in a Claycode drawing. 

     This heuristic assumes an ideal space distribution of the 
     children, i.e., it assumes that the children are arranged
     so that they form a perfect circle, which must be padded.
             ___
           /    p\    `O` is the area occupied by the children, 
          |   O---|   while `p` is the padding to add to compute
           \ ___ /    the parent's node area.

  // const children_r = Math.sqrt(children_weight / Math.PI);
  // const father_r = children_r + node_padding;
  // node.weight = Math.pow(father_r, 2) * Math.PI;
     
    Not working well so I went back to basic +1 heuristic 
  */

  node.weight = children_weight + node_padding;
  node.weight = Math.max(node.weight, 1);
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
