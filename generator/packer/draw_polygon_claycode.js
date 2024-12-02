import { drawPolygon } from "./draw.js";
import { area, centroid, padPolygon } from "../geometry/geometry.js";
import { partitionPolygon } from "../geometry/polygon_partition.js";
import { createStarPolygon } from "../geometry/shapes.js";

const BLACK = 0x000000;
const WHITE = 0xffffff;

/* 
  Draw nested polygons with static paddings defined by frame_paddings.
  Return the next polygon and color to use.  
*/
function drawFrame(
  polygon,
  min_node_area,
  colors = [WHITE, BLACK],
  color_index = 0
) {

  // Sorted from outer to inner
  const frame_paddings = [
    15,
  ];

  let curr_polygon = polygon;
  let curr_color = colors[color_index];
  for (const padding of frame_paddings) {
    drawPolygon(curr_polygon, curr_color);
    curr_polygon = padPolygon(curr_polygon, padding);
    color_index = (color_index + 1) % colors.length
    curr_color = colors[color_index];

    if (area(curr_polygon) < min_node_area) {
      throw "Not enough space";
    }
  }

  return [curr_polygon, color_index];
}

export function drawClaycode(
  node,
  polygon,
  node_padding,
  min_node_area,
  mustDrawFrame = true,
  colors = [

    // 0x003399, // Darker Blue (adjusted tone)
    // 0x0057B7, // Original Blue (official EU flag color)

    0x113CCF, // Persian Blue
    0xFCD018, // Blast Off Yellow

    // 0x3CAEA3, // Teal
    // 0xF6D55C, // Yellow
    // 0xED553B  // Coral Red

    // 0x4B0082, // Indigo
    // 0x800080, // Purple
    // 0x8A2BE2, // Blue Violet
    // 0x9932CC, // Dark Orchid
    // 0xBA55D3, // Medium Orchid
    // 0xDA70D6, // Orchid
    // 0xD8BFD8, // Thistle
    // 0xE6E6FA, // Lavender
    // 0xFF00FF, // Magenta
    // 0x9400D3  // Dark Violet
  ],
  color_index = 0
) {
  let color = colors[color_index];
  if (mustDrawFrame) {
    [polygon, color_index] = drawFrame(polygon, min_node_area, colors);
  }
  color = colors[color_index];

  drawPolygon(polygon, color);

  const sub_polygon = padPolygon(polygon, node_padding);

  if (area(sub_polygon) < min_node_area) {
    throw "Not enough space";
  }

  if (node.children.length == 0) {
    // Draw leaf
    const sub_polygon = padPolygon(polygon, 3);

    // drawPolygon(sub_polygon, colors[(color_index + 1) % colors.length]);
    const star = createStarPolygon(sub_polygon, 5, /*3.44*/);
    drawPolygon(star, colors[(color_index + 1) % colors.length]);// 0xFFCC00); //0xF6D55C);
    return;
  } else if (node.children.length == 1) {
    drawClaycode(
      node.children[0],
      sub_polygon,
      node_padding,
      min_node_area,
      false,
      colors,
      (color_index + 1) % colors.length
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
        false,
        colors,
        (color_index + 1) % colors.length
      );
    }
  }
}

