/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

/**
 * Common TreeNode class used by both scanner and generator
 */
export class TreeNode {
  constructor(father = null, children = []) {
    this.id = null; // Used by scanner
    this.father = father;
    this.children = children;
    this.label = null;
    this.polygon = null;
    this.tree = null;

    for (const c of children) {
      children.father = this;
    }

    this.numDescendants = 0;
    /* Describes how much space is taken by this node, considering
       also all its descendants. The UoM is irrelevant, as long as
       all nodes are weighted using the same heuristics. */
    this.footprint = null;

    /* Root is at depth zero. Other nodes have depth parent+1  */
    this.depth = null;
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

  isRoot() {
    return this.father === null;
  }

  setPolygon(polygon) {
    this.polygon = polygon;
  }

  getPolygon() {
    return this.polygon;
  }

  addChild(child) {
    if (child && !this.children.includes(child)) {
      this.children.push(child);
    }
  }

  toString() {
    let result = '';

    function serialize(node) {
      if (!node) return;

      result += '(';
      for (const child of node.children) {
        serialize(child);
      }
      result += ')';
    }

    serialize(this);
    return result;
  }

  static fromString(str) {
    if (!str || str[0] !== '(' || str[str.length - 1] !== ')') return null;

    let stack = [];
    let root = null;
    let currentNode = null;

    for (let char of str) {
      if (char === '(') {
        let newNode = new TreeNode();
        if (currentNode) {
          currentNode.children.push(newNode);
          newNode.father = currentNode;
        } else {
          root = newNode;
        }
        stack.push(newNode);
        currentNode = newNode;
      } else if (char === ')') {
        if (!stack.length) {
          return null; // Unbalanced brackets
        }
        stack.pop();
        currentNode = stack.length ? stack[stack.length - 1] : null;
      } else {
        return null; // Invalid character in string
      }
    }

    return root;
  }
}