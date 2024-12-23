import { area, padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";

export function drawClaycode(
  node,
  polygon,
  packerBrush,
) {

  /* 
   * First, make sure there is enough free space
   */
  const subPolygon = padPolygon(polygon, packerBrush.getNodePadding());
  if (subPolygon === null || area(subPolygon) < packerBrush.getMinNodeArea()) {
    return false;
  }

  /* 
   * Next, draw node
   */
  packerBrush.drawNode(polygon, subPolygon, node);
  if (node.children.length == 1) {
    return drawClaycode(
      node.children[0],
      subPolygon,
      packerBrush
    );
  } else {
    /* 
     * Finally, partition the node and recursively call the function
     */
    const weights = Math.normalise(node.children.map((c) => c.weight));
    const partition = partitionPolygon(subPolygon, weights);
    console.assert(partition.length == node.children.length);
    for (const [i, c] of node.children.entries()) {
      if (!drawClaycode(
        c,
        partition[i],
        packerBrush
      )) {
        return false;
      }
    }
  }

  return true;
}

