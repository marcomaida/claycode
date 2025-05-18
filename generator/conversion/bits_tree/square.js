/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

import { Tree } from "../../tree/tree.js"
import { TreeNode } from "../../tree/tree_node.js";

// Used by sample generator
export function getDescription() {
    return "Square"
}

function bitArrayToInt(bits) {
    let newBits = Array.from(bits); 
    newBits.unshift(1); // Add 1 at beginning to make sure it is an integer
    return Array.from(newBits).reverse().reduce((acc, c, i) => acc + BigInt(c) * 2n ** BigInt(i), 0n);
}

function intToBitArray(x) {
    console.assert(typeof x === "bigint");
    if (x <= 0n) {
        throw new Error("Input must be greater than 0");
    }
    return x.toString(2).slice(1).split("").map((x) => parseInt(x)); // Remove initial 1
}

function largestSquareBinsearch(x) {
    console.assert(typeof x === "bigint");
    if (x === 1n) {
        return 1n;
    }

    let l = 0n;
    let r = x;

    while (true) {
        const mid = l + ((r - l) / 2n);
        const midSq = mid * mid;

        if (midSq <= x && (mid + 1n) ** 2n > x) {
            return mid;
        } else {
            if (midSq <= x) {
                l = mid;
            } else {
                r = mid;
            }
        }
    }
}

function numberToSquareDecomposition(x) {
    console.assert(typeof x === "bigint");
    const decomposition = [];
    x -= 1n;

    while (x > 0n) {
        const lsq = largestSquareBinsearch(x);
        decomposition.push(lsq);
        x -= lsq ** 2n;
    }

    return decomposition;
}

function squareDecompositionToNumber(dec) {
    return dec.reduce((sum, num) => sum + num ** 2n, 1n); // Start accumulating from 1 to do +1
}

/* Encoding functions */

export function bitsToTree(bitsArray) {
    function populateTreeOfNumber(root, n) {
        const dec = numberToSquareDecomposition(n);
        root.children = dec.map(() => new TreeNode());
        for (let i = 0; i < root.children.length; i++) {
            populateTreeOfNumber(root.children[i], dec[i]);
        }
    }

    const root = new TreeNode();
    const n = bitArrayToInt(bitsArray);
    populateTreeOfNumber(root, n);

    return new Tree(root);
}

export function treeToBits(tree) {
    function treeToNumber(root) {
        if (root.children.length === 0) {
            return 1n;
        } else {
            const dec = root.children.map(c => treeToNumber(c));
            return squareDecompositionToNumber(dec);
        }
    }

    return intToBitArray(treeToNumber(tree.root));
}
