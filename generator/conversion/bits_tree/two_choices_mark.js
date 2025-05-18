/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

import { Tree } from "../../tree/tree.js"
import { TreeNode } from "../../tree/tree_node.js";

// Used by sample generator
export function getDescription() {
    return "Two choices (mark)"
}

function* bitStream(bitsArray) {
    for (const bit of bitsArray) {
        if (bit !== 0 && bit !== 1) {
            throw `Invalid bit array: ${bit}`
        }
        yield bit;
    }

    yield 1; // final extra one, necessary in current encoding
}

export function bitsToTree(bitsArray) {
    console.log("Encoding using two_choices_mark");
    let root = new TreeNode(null)
    root.children = [new TreeNode(root)]
    let frontier = [root.children[0]];
    let iter = bitStream(bitsArray)
    for (let bit of iter) {
        let node = frontier.shift();

        if (frontier.length > 0) { // node is allowed to have no children
            if (bit == 0) continue; // no child
            else {
                bit = iter.next().value; // node will have children, a 1 has been processed
                if (bit === undefined) bit = 0 // edge case in which this was the last 1
            }
        }

        if (bit === 0)
            node.children = [new TreeNode(node), new TreeNode(node)];
        else {
            console.assert(bit === 1)
            node.children = [new TreeNode(node), new TreeNode(node), new TreeNode(node)];
        }

        for (const c of node.children)
            frontier.push(c)
    }

    // wrap_tree(root);
    add_order_markers(root);
    return new Tree(root);
}

export function are_all_children_equivalent(node) {
    for (let i = 1; i < node.children.length; i++) {
        if (!node.children[i - 1].tree_eq(node.children[i])) {
            return false
        }
    }

    return true
}

/**
 * Generates an order marker for the nth child.
 * n=0 => add nothing
 * n=1 => (( ))
 * n=2 => (( () ))
 * n=3 => (( (),() ))
 * n=k => (( () ... k-1 children ... () ))
 */
export function add_order_marker(node, n) {
    if (n < 0) { throw `Invalid n for order marker: ${n}`; }
    if (n == 0) { return; }

    let inner_node = new TreeNode();
    node.children.push(new TreeNode(node, [inner_node]));
    for (let i = 0; i < n - 1; i++) {
        inner_node.children.push(new TreeNode(inner_node));
    }
}


/**
 * Encode child ordering in topology by adding order markers
 * 
 * ((),(),()) => ((),( (()) ),( ((())) )
 */
export function add_order_markers(parent_node) {
    let needs_ord = !are_all_children_equivalent(parent_node);

    for (const [i, c] of parent_node.children.entries()) {
        add_order_markers(c);

        if (needs_ord) {
            add_order_marker(c);
        }
    }
}


/**
 * Encode child ordering in topology by adding nth intermediate nodes 
 * to the nth child. 
 * ((),(),()) => ((),(()),((())))
 */
export function wrap_tree(parent_node) {
    let needs_ord = !are_all_children_equivalent(parent_node)

    for (const [i, c] of parent_node.children.entries()) {
        wrap_tree(c)

        if (needs_ord) {
            let wrap_node = c
            for (let w = 0; w < i; w++) {
                parent_node.children[i] = new TreeNode(parent_node, [wrap_node])
                wrap_node.parent_node = parent_node.children[i]
                wrap_node = parent_node.children[i]
            }
        }
    }
}

export function treeToBits(tree) {
    let root = tree.root
    let frontier = [root.children[0]];
    let bits = []

    while (frontier.length > 0) {
        let node = frontier.shift();

        // 1 - If the node has a choice, does it have children?
        if (frontier.length > 0) {
            if (node.children.length === 0) bits += [0]
            else bits += [1]
        }

        // 2 - How many children?
        if (node.children.length === 2) bits += [0]
        else if (node.children.length === 3) bits += [1]
        else console.assert(node.children.length === 0)

        for (const c of node.children)
            frontier.push(c)
    }

    const last_one = bits.lastIndexOf(1)
    return bits.slice(0, last_one)
}
