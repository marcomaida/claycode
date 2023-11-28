import { assert } from "console";
import { Tree } from "../../tree/tree.js"
import { TreeNode } from "../../tree/tree_node.js";

/* Util */

function bitStringToInt(bits) {
    bits = "1" + bits; // Make sure it is an integer
    return Array.from(bits).reverse().reduce((acc, c, i) => acc + BigInt(c)*2n**BigInt(i), 0n);
}

function intToBitString(n) {
    assert(typeof n === "bigint");
    if (n <= 0) {
        throw new Error("Input must be greater than 0");
    }
    return n.toString(2).slice(1); // Remove initial 1
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
