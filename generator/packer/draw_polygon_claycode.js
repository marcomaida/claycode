/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

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

