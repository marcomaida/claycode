export class TreeNode {
  constructor(father = null, children = []) {
    this.father = father;
    this.children = children;
    this.label = null;
    this.tree = null;

    for (const c of children) {
      children.father = this;
    }

    this.numDescendants = 0;
    /* Describes how much space is taken by this node, considering
       also all its descendants. The UoM is irrelevant, as long as
       all nodes are weighted using the same heuristics. */
    this.weight = null;
  }

  /**
   * Check if the tree starting at this node is topologically equivalent
   * to the other given node
   */
  tree_eq(other_node) {
    var frontier = [[this, other_node]];

    while (frontier.length > 0) {
      var pair = frontier.shift();

      if (pair[0].children.length != pair[1].children.length) return false;

      for (var i = 0; i < pair[0].children.length; i++)
        frontier.push([pair[0].children[i], pair[1].children[i]]);
    }

    return true;
  }

  isLeaf() {
    return this.children.length === 0;
  }
}
