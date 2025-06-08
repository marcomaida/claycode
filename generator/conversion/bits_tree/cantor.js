/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { assert } from "console";
import { Tree } from "../../tree/tree.js"
import { TreeNode } from "../../tree/tree_node.js";

// Used by sample generator
export function getDescription() {
    return "Cantor"
}

function bitStringToInt(bits) {
    bits.unshift("1"); // Add 1 at beginning to make sure it is an integer
    return Array.from(bits).reverse().reduce((acc, c, i) => acc + BigInt(c)*2n**BigInt(i), 0n);
}

function intToBitString(x) {
    assert(typeof x === "bigint");
    if (x <= 0n) {
        throw new Error("Input must be greater than 0");
    }
    return x.toString(2).slice(1); // Remove initial 1
}

function gauss(k) {
    assert(typeof k === "bigint");
    if (k <= 0) {
        throw new Error("Input must be greater than 0");
    }
    return (k*(k + 1n)) / 2n
}

function largestKthGaussBinsearch(x) {
    assert(typeof x === "bigint");
    if (x <= 0n) {
        throw new Error("Input must be greater than 0");
    }
    if (x === 1n) {
        return 1n;
    }

    let l = 0n;
    let r = x;

    while (true) {
        let mid = (l + r) / 2n;
        let midGauss = gauss(mid);
        
        if (midGauss <= x && gauss(mid + 1n) > x) {
            return mid;
        } else {
            if (midGauss <= x) {
                l = mid;
            } else {
                r = mid;
            }
        }
    }
}

// Returns the minimum k for which (k*(k+1))/2 >= n
function largestKthGaussCeiling(x) {
    let k = largestKthGaussBinsearch(x)
    return gauss(k) === x ? k : k+1n;
}

function cantorBisect(x, nDimensions) {}

function cantorBisectInverse(coordinates) {}

function numberToCantorDecomposition(x, nDimensions) {}

function cantorDecompositionToNumber(coordinates) {}

/* Encoding functions */

export function bitsToTree(bitsArray) { }

export function treeToBits(tree) { }
