import { drawPolygon } from "./draw.js";
import { area, padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";

const BLACK = 0x000000;
const WHITE = 0xffffff;

function inverse_color(color) {
  if (color === WHITE) return BLACK;
  else return WHITE;
}

/* 
  Draw nested polygons with static paddings defined by frame_paddings.
  Return the next polygon and color to use.  
*/
function drawFrame(
  polygon,
  min_node_area,
  color
) {
  // Sorted from outer to inner
  const frame_paddings = [
    5,
    5,
    5,
  ];

  drawPolygon(polygon, color);

  let curr_polygon = polygon;
  let curr_color = color;
  for (const padding of frame_paddings) {
    drawPolygon(curr_polygon, curr_color);
    curr_polygon = padPolygon(curr_polygon, padding);
    curr_color = inverse_color(curr_color);

    if (area(curr_polygon) < min_node_area) {
      throw "Not enough space";
    }
  }

  return [curr_polygon, curr_color];
}

function drawClaycodeRec(
  node,
  polygon,
  node_padding,
  min_node_area,
  color
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
    drawClaycodeRec(
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
      drawClaycodeRec(
        c,
        partition[i],
        node_padding,
        min_node_area,
        inverse_color(color)
      );
    }
  }
}

export function drawClaycode(
  node,
  polygon,
  node_padding,
  min_node_area,
  color = WHITE
) {
  [polygon, color] = drawFrame(polygon, min_node_area, color);
  
  drawClaycodeRec(
    node,
    polygon,
    node_padding,
    min_node_area,
    color
  );
}