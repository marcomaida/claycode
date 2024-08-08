import { Tree } from "../tree/tree.js";
import { TreeNode } from "../tree/tree_node.js";

// Given a tree, create a new tree where the original
// tree is copied N times. A new root is added.
export function duplicateTreeNTimes(tree, N) {
    // Create a new root node
    const newRoot = new TreeNode();

    // Function to deep clone a tree node
    function cloneNode(node) {
        const newNode = new TreeNode(null, []);
        newNode.label = node.label;
        newNode.numDescendants = node.numDescendants;
        newNode.weight = node.weight;

        for (const child of node.children) {
            const newChild = cloneNode(child);
            newChild.father = newNode;
            newNode.children.push(newChild);
        }

        return newNode;
    }

    // Duplicate the original tree N times and add to the new root
    for (let i = 0; i < N; i++) {
        // Clone tree
        const clonedTree = cloneNode(tree.root);

        if (N > 1) {
            // Add an intermediate node to make a 2-tower
            const frameNode = new TreeNode(newRoot, [clonedTree]);
            clonedTree.father = frameNode;
            newRoot.children.push(frameNode);
        }
        else {
            // In the N=1 case, we do not need to make a 2-tower; it is
            // done automatically as there is only 1 child
            newRoot.children.push(clonedTree);
        }
    }

    // Initialize the new tree
    const newTree = new Tree(newRoot);
    newTree.initialize_nodes(newRoot, "X", 0);
    newTree.compute_weights(1);

    return newTree;
}

// Generates a random tree with N node. 
// The generation is biased so that trees are large and not tall.
// A root is created. Then, for each iteration, a random existing node is chosen and a 
// child is added to it. Naturally, this will bias towards short trees.
export function generateRandomTree(N) {
    const MIN_LEVEL_1_CHILDREN = 3;

    if (N <= 0) return null;

    // Helper function to create a tree node
    function createNode(father = null) {
        return new TreeNode(father, []);
    }

    // Create the root node
    const root = createNode();
    let nodes = [root];
    for (let n = 0; n < N; n++) {
        // pick a random node, add a child. 
        // This over-represents lower-level nodes, leading to trees that are wider
        let node = nodes[Math.floor(Math.random() * nodes.length)];
        if (n < MIN_LEVEL_1_CHILDREN) {
            node = nodes[0]; // force the root for the first 3 nodes 
        }
        const newNode = createNode(node);
        node.children.push(newNode);
        nodes.push(newNode);
    }

    // Initialize the tree
    const tree = new Tree(root);
    tree.initialize_nodes(root, "X", 0);
    tree.compute_weights(1);

    return tree;
}