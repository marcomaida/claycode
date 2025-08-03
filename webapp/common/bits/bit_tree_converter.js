/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { BitString } from "./bit_string.js";
import { Tree } from "../tree/tree.js";
import { TreeNode } from "../tree/tree_node.js";

const MAX_NUMBER = 2n ** 2000n;

/**
 * Common BitTreeConverter class used by both scanner and generator
 */
export class BitTreeConverter {
    static treeToBits(tree) {
        if (!tree) return new BitString("");

        const number = this.treeToNumber(tree);
        return this.numberToBitString(number);
    }

    static treeToNumber(tree) {
        if (!tree.children || tree.children.length === 0) {
            return 1n;
        }

        const childNumbers = tree.children.map(child => this.treeToNumber(child));

        // Check if any child number is 0 (overflow occurred)
        if (childNumbers.some(num => num === 0n)) {
            console.warn("Overflow occurred in treeToNumber, returning 0");
            return 0n;
        }

        return this.squareDecompositionToNumber(childNumbers);
    }

    static squareDecompositionToNumber(decomposition) {
        let sum = 0n;
        for (const num of decomposition) {
            sum += num * num;

            // Check if sum exceeds MAX_NUMBER
            if (sum + 1n > MAX_NUMBER) {
                return 0n;
            }
        }
        return sum + 1n;
    }

    static numberToBitString(number) {
        const binaryStr = number.toString(2);
        return new BitString(binaryStr.substring(1));
    }

    static bitsToTree(bitsArray) {
        const root = new TreeNode();
        const n = this.bitArrayToInt(bitsArray);
        this.numberToTree(n, root);
        return new Tree(root);
    }

    static bitArrayToInt(bits) {
        // Handle BitString objects
        if (bits instanceof BitString) {
            bits = bits.toString().split('').map(b => parseInt(b));
        }
        // Handle string inputs
        else if (typeof bits === 'string') {
            bits = bits.split('').map(b => parseInt(b));
        }

        let newBits = Array.from(bits);
        newBits.unshift(1); // Add 1 at beginning to make sure it is an integer
        return Array.from(newBits).reverse().reduce((acc, c, i) => acc + BigInt(c) * 2n ** BigInt(i), 0n);
    }

    static intToBitArray(x) {
        if (typeof x !== "bigint") {
            throw new Error("Input must be a BigInt");
        }
        if (x <= 0n) {
            throw new Error("Input must be greater than 0");
        }
        return x.toString(2).slice(1).split("").map((x) => parseInt(x)); // Remove initial 1
    }

    static largestSquareBinsearch(x) {
        if (typeof x !== "bigint") {
            throw new Error("Input must be a BigInt");
        }
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

    static numberToSquareDecomposition(x) {
        if (typeof x !== "bigint") {
            throw new Error("Input must be a BigInt");
        }
        const decomposition = [];
        x -= 1n;

        while (x > 0n) {
            const lsq = this.largestSquareBinsearch(x);
            decomposition.push(lsq);
            x -= lsq ** 2n;
        }

        return decomposition;
    }

    // This is needed for the bitsToTree method
    static squareDecompositionToTree(decomposition, root) {
        root.children = decomposition.map(() => new TreeNode());
        for (let i = 0; i < decomposition.length; i++) {
            this.numberToTree(decomposition[i], root.children[i]);
        }
    }

    static numberToTree(n, node) {
        if (n === 1n) return;
        const decomposition = this.numberToSquareDecomposition(n);
        this.squareDecompositionToTree(decomposition, node);
    }
}
