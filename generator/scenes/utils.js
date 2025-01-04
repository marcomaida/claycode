import { textToBits } from "../conversion/convert.js";
import { clearDrawing, initDrawing } from "../packer/draw.js";
import { area } from "../geometry/geometry.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { DefaultBrush, PackerBrush } from "../packer/packer_brush.js";
import { createMouseHeadPolygon, createCirclePolygon } from "../geometry/shapes.js";
import { TreeNode } from "../tree/tree_node.js";
import { packClaycode } from "../packer/pack.js";

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
      } Nodes | Footprint: ${currentTree.get_total_footprint()} ` + infoSuffix;
  else
    infoText.textContent =
      `${currentTree.root.numDescendants} Nodes | Footprint: ${currentTree.get_total_footprint()}` + infoSuffix;
}

// Helper function to avoid too many calls to the drawing function
// by fast-repeating keystrokes
export function debounce(func, delay, timerId) {
  infoText.textContent = `Packing...`;
  clearTimeout(timerId);
  return setTimeout(func, delay);
}

export async function showChangeShapeLabel(isVisible, message = "Change Shape") {
  const changeShapeDiv = await getElementByIdAndKeepTrying("changeShapeDiv");
  changeShapeDiv.style.visibility = isVisible ? "visible" : "collapse";
  const changeShapeText = await getElementByIdAndKeepTrying("changeShapeText");
  changeShapeText.textContent = message;
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
export function getPolygonOfIndex(index, polygonCenter, polygonSize) {
  return createCirclePolygon(
    polygonCenter,
    polygonSize,
    POLYGON_SHAPES[index][0],
    POLYGON_SHAPES[index][1],
    POLYGON_SHAPES[index][2]
  );
}

export function drawPolygonClaycode(
  current_tree,
  polygon
) {
  if (packClaycode(current_tree, polygon)) {
    let brush = new DefaultBrush();
    drawClaycode(current_tree, polygon, brush)
    return true;
  }
  else {
    return false;
  }
}
