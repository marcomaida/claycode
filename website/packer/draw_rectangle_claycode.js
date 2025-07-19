/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { drawRoundedRect } from "./draw.js";

const BLACK = 0x000000;
const WHITE = 0xffffff;

function inverse_color(color) {
  if (color === WHITE) return BLACK;
  else return WHITE;
}

export function drawClaycode(node, bar_frame, color = WHITE) {
  /* Bar is expected in the form [top_left, top_right, bottom_right, bottom_left] */
  const bar_width = bar_frame[1].x - bar_frame[0].x;
  const bar_height = bar_frame[3].y - bar_frame[0].y;

  const shorter = Math.min(bar_width, bar_height);
  const round = Math.min(shorter / 5, 15);

  drawRoundedRect(
    bar_frame[0].x,
    bar_frame[0].y,
    bar_width,
    bar_height,
    round,
    color
  );

  if (node.isLeaf()) return;

  /* A node should take exactly as much horizontal and vertical space as 1/numDescendants */
  const parent_rel_space = (1 / node.numDescendants) ** 0.65;
  //const parent_rel_space = 1 / (node.tree.maxDepth + 1)

  if (bar_width >= bar_height) {
    // Horizontal layout
    const inter_margin =
      (parent_rel_space * bar_width) / (1 + node.children.length); // num of vertical bars
    const side_margin = (parent_rel_space * bar_height) / 2; // There are always two side margins

    let top_left = bar_frame[0]
      .clone()
      .add(new PIXI.Vec(inter_margin, side_margin));

    for (let c of node.children) {
      const child_weight = c.numDescendants / (node.numDescendants - 1);
      const child_width = bar_width * (1 - parent_rel_space) * child_weight;
      const child_height = bar_height * (1 - parent_rel_space);
      var child_frame = [
        top_left.clone(),
        top_left.clone().add(new PIXI.Vec(child_width, 0)),
        top_left.clone().add(new PIXI.Vec(child_width, child_height)),
        top_left.clone().add(new PIXI.Vec(0, child_height)),
      ];

      drawClaycode(c, child_frame, inverse_color(color));
      top_left.add(new PIXI.Vec(child_width + inter_margin, 0));
    }
  } else {
    // vertical layout
    const side_margin = (parent_rel_space * bar_width) / 2; // There are always two side margins
    const inter_margin =
      (parent_rel_space * bar_height) / (1 + node.children.length); // num of horizontal bars

    let top_left = bar_frame[0]
      .clone()
      .add(new PIXI.Vec(side_margin, inter_margin));

    for (let c of node.children) {
      const child_weight = c.numDescendants / (node.numDescendants - 1);
      const child_height = bar_height * (1 - parent_rel_space) * child_weight;
      const child_width = bar_width * (1 - parent_rel_space);
      var child_frame = [
        top_left.clone(),
        top_left.clone().add(new PIXI.Vec(child_width, 0)),
        top_left.clone().add(new PIXI.Vec(child_width, child_height)),
        top_left.clone().add(new PIXI.Vec(0, child_height)),
      ];

      drawClaycode(c, child_frame, inverse_color(color));
      top_left.add(new PIXI.Vec(0, child_height + inter_margin));
    }
  }
}
