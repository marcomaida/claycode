import { drawPolygon } from "./draw.js";
import { area, padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";

const BLACK = 0x000000;
const WHITE = 0xffffff;

function inverse_color(color) {
  if (color === WHITE) return BLACK;
  else return WHITE;
}

export function drawClaycode(
  node,
  polygon,
  node_padding,
  min_node_area,
  color = WHITE
) {
  // Random color debug:
  // color = Math.floor(Math.random() * 16777215).toString(16);

  drawPolygon(polygon, color);
  const sub_polygon = padPolygon(polygon, node_padding);

  if (area(sub_polygon) < min_node_area) {
    throw "Not enough space";
  }

  if (node.children.length == 0) {
    // Draw leaf
    drawPolygon(sub_polygon, inverse_color(color));
    return;
  } else if (node.children.length == 1) {
    drawClaycode(
      node.children[0],
      sub_polygon,
      node_padding,
      min_node_area,
      inverse_color(color)
    );
  } else {
    const weights = Math.normalise(node.children.map((c) => c.weight));
    const partition = partitionPolygon(sub_polygon, weights);

    console.assert(partition.length == node.children.length);
    for (const [i, c] of node.children.entries()) {
      drawClaycode(
        c,
        partition[i],
        node_padding,
        min_node_area,
        inverse_color(color)
      );
    }
  }
}
