import { drawPolygon } from "./draw.js";
import { padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";

const BLACK = 0x000000;
const WHITE = 0xffffff;

function inverse_color(color) {
  if (color === WHITE) return BLACK;
  else return WHITE;
}

export function drawClaycode(node, polygon, color = WHITE) {
  drawPolygon(polygon, color);
  const sub_polygon = padPolygon(polygon, 3.5);

  if (node.children.length == 0) {
    return;
  } else if (node.children.length == 1) {
    drawClaycode(node.children[0], sub_polygon, inverse_color(color));
  } else {
    const weights = Math.normalise(
      node.children.map((c) => Math.pow(c.numDescendants, 1))
    );
    const partition = partitionPolygon(sub_polygon, weights);

    console.assert(partition.length == node.children.length);
    for (const [i, c] of node.children.entries()) {
      drawClaycode(c, partition[i], inverse_color(color));
    }
  }
}
