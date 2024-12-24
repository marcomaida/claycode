import { area, padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";

export function drawClaycode(tree, polygon, brush) {
  brush.drawRoot(polygon);
  return _drawClaycode(tree.root, brush);
}

export function _drawClaycode(
  node,
  brush,
) {
  brush.drawNode(node);
  for (const c of node.children) {
    _drawClaycode(c, brush);
  }
}

