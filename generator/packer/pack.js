/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

import { area, padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";

/**
 * Implements the high-level packing strategy: start with high padding,
 * and attempt to pack while slowly decreasing the padding. 
 * Fail if no solution is found.
 */
export function packClaycode(tree, polygon) {
    // Start with large padding, decrease at each fail
    // If there are few nodes, be ambitious with padding
    // Once reached a certain limit, start from the minimum
    let nodePaddingMin = 2;
    let nodePaddingMax = Math.lerp(
        20,
        nodePaddingMin + 2,
        Math.min(tree.root.numDescendants, 700) / 700
    );

    const MAX_TRIES = 60;
    let tries = 0;
    while (tries < MAX_TRIES) {
        // Decrease padding if it keeps failing
        const padding = Math.lerp(
            nodePaddingMax,
            nodePaddingMin,
            tries / MAX_TRIES
        );
        tree.compute_footprints(padding);

        try {
            if (packClaycodeIteration(tree.root, polygon, padding)) {
                return true;
            }
        } catch (error) {
            console.error(error);
        }

        tries++;
        if (tries == MAX_TRIES) {
            return false;
        }
    }
}

/**
 * Implements a single attempt to pack a Claycode, with a fixed
 * padding and min node area.
 */
function packClaycodeIteration(
    node,
    polygon,
    padding,
) {
    /* 
     * Do first padding phase
     * In the case of the root, we double the padding, to make it consistent.
     */
    const subPolygon = padPolygon(polygon, node.isRoot() ? padding : padding / 2);
    if (subPolygon === null) {
        return false;
    }

    /* 
     * Next, assign the polygon to the node
     */
    node.setPolygon(subPolygon);

    /*
     * Do a second padding phase. Note that, in the case of leaves,
     * this forces them to have a minimum area.
     */
    const subsubPolygon = padPolygon(subPolygon, padding / 2);
    if (subsubPolygon === null) {
        return false;
    }


    /* 
     * Finally, partition the node and recursively call the function
     */
    const footprints = Math.normalise(node.children.map((c) => c.footprint));
    const partition = partitionPolygon(subsubPolygon, footprints);
    console.assert(partition.length == node.children.length);
    for (const [i, c] of node.children.entries()) {
        if (!packClaycodeIteration(
            c,
            partition[i],
            padding
        )) {
            return false;
        }
    }

    return true;
}
