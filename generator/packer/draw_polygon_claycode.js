/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

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

