import { textToBits } from "../conversion/convert.js";
import { clearDrawing, initDrawing } from "../packer/draw.js";
import { area, circlePolygon } from "../geometry/geometry.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { DefaultBrush, PackerBrush } from "../packer/packer_brush.js";
import { createMouseHeadPolygon } from "../geometry/shapes.js";
import { TreeNode } from "../tree/tree_node.js";

export function initPIXI() {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 1,
    antialias: true,
  });
  initDrawing(app);

  pixiDiv.appendChild(app.view);

  return app;
}

/**
 * Since scripts start before the page is fully loaded, sometimes components
 * cannot be found. Keep trying until they are available.
 * May never return.
 */
export async function getElementByIdAndKeepTrying(element_name) {
  while (document.getElementById(element_name) === null) {
    await new Promise((r) => setTimeout(r, 100));
  }

  return document.getElementById(element_name);
}

export async function initInputText() {
  const inputTextBox = await getElementByIdAndKeepTrying("inputText");
  inputTextBox.select();
  inputTextBox.focus();
  return inputTextBox;
}

export function initInfoText() {
  const infoText = document.getElementById("infoText");
  infoText.textContent = "";
  return infoText;
}

export function updateInfoText(inputText, currentTree, infoSuffix = "") {
  const infoText = document.getElementById("infoText");
  if (inputText !== null)
    infoText.textContent =
      `${inputText.length} Chars | ${textToBits(inputText).length} bits | ${currentTree.root.numDescendants
      } Nodes ` + infoSuffix;
  else
    infoText.textContent =
      `${currentTree.root.numDescendants} Nodes` + infoSuffix;
}

// Helper function to avoid too many calls to the drawing function
// by fast-repeating keystrokes
export function debounce(func, delay, timerId) {
  infoText.textContent = `Packing...`;
  clearTimeout(timerId);
  return setTimeout(func, delay);
}

export async function showChangeShapeLabel(is_visible) {
  const changeShapeLabel = await getElementByIdAndKeepTrying("changeShapeDiv");
  changeShapeLabel.style.visibility = is_visible ? "visible" : "collapse";
}

// Shape management
export const POLYGON_SHAPES = [
  // [num_edges, scale, rotation_deg]
  [4, new PIXI.Vec(1, 1), 45],
  [50, new PIXI.Vec(1, 1), 0],
  [3, new PIXI.Vec(1, 1), 0],
  [4, new PIXI.Vec(1.5, 0.7), 45],
  [8, new PIXI.Vec(1, 1), 0],
];
export function drawPolygonClaycode(
  current_tree,
  current_shape,
  polygon_center,
  polygon_size
) {
  // Start with large padding, decrease at each fail
  let node_padding_min = 2.5;

  // If there are few nodes, be ambitious with padding
  // Once reached a certain limit, start from the minimum
  let nodePaddingMax = Math.lerp(
    15,
    node_padding_min,
    Math.min(current_tree.root.numDescendants, 400) / 400
  );

  let polygon = circlePolygon(
    polygon_center,
    polygon_size,
    POLYGON_SHAPES[current_shape][0],
    POLYGON_SHAPES[current_shape][1],
    POLYGON_SHAPES[current_shape][2]
  );

  // let polygon = createMouseHeadPolygon(polygon_center, polygon_size * .6)

  // Try to draw for a certain max number of times
  const MAX_TRIES = 100;
  let tries = 0;
  while (tries < MAX_TRIES) {
    // Decrease padding if it keeps failing
    const padding = Math.lerp(
      nodePaddingMax,
      node_padding_min,
      tries / MAX_TRIES
    );
    current_tree.compute_weights(padding);

    let minNodeArea = area(polygon) * 0.0002;

    try {
      clearDrawing();
      // padding, minNodeArea
      let brush = new DefaultBrush(PackerBrush.Shape.SQUARE, padding, minNodeArea);
      if (drawClaycode(current_tree, polygon, brush))
        return true;
    } catch (error) {
      console.error(error);
    }

    tries++;
    if (tries == MAX_TRIES) {
      clearDrawing();
      return false;
    }
  }
}
