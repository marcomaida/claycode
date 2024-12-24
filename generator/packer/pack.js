import { area, padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";

export function packClaycode(
    node,
    polygon,
    packer_brush,
) {
    /* 
     * First, make sure there is enough free space
     */
    let node_padding = packer_brush.getNodePadding();
    let min_node_area = packer_brush.getMinNodeArea();
    const sub_polygon = padPolygon(polygon, node_padding);
    if (sub_polygon === null || area(sub_polygon) < min_node_area) {
        return false;
    }
    // TODO
    // TODO
    // TODO
    // TODO
    // TODO
    // TODO

    /* 
     * Next, draw node
     */
    packer_brush.drawNode(polygon, sub_polygon, node);
    if (node.children.length == 1) {
        return drawClaycode(
            node.children[0],
            sub_polygon,
            packer_brush
        );
    } else {
        /* 
         * Finally, partition the node and recursively call the function
         */
        const weights = Math.normalise(node.children.map((c) => c.weight));
        const partition = partitionPolygon(sub_polygon, weights);
        console.assert(partition.length == node.children.length);
        for (const [i, c] of node.children.entries()) {
            if (!drawClaycode(
                c,
                partition[i],
                packer_brush
            )) {
                return false;
            }
        }
    }

    return true;
}

