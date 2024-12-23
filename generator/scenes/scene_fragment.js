import { } from "../geometry/vector.js";
import { area } from "../geometry/geometry.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { createCirclePolygon } from "../geometry/shapes.js";
import * as utils from "./utils.js";
import { Tree } from "../tree/tree.js";
import { generateRandomTree, duplicateTreeNTimes } from "../tree/util.js"

const app = utils.initPIXI();
const infoText = utils.initInfoText();
const inputTreeTopology = document.getElementById("inputTreeTopology");
const inputNumFragments = document.getElementById("inputNumFragments");
const inputNumNodes = document.getElementById("inputNumNodes");

function polygonView() {

  let current_tree = Tree.fromString(inputTreeTopology.value)
  if (!current_tree) {
    inputTreeTopology.value = generateRandomTree(inputNumNodes.value).toString();
    current_tree = Tree.fromString(inputTreeTopology.value)
    if (!current_tree) {
      throw `current tree cannot be null after the tree was generated`;
    }
  }

  clearDrawing();
  current_tree = duplicateTreeNTimes(current_tree, inputNumFragments.value);

  const polygon_center = new PIXI.Vec(
    window.innerWidth * 0.5,
    window.innerHeight / 2
  );
  const polygon_size =
    Math.min(window.innerWidth / 2, window.innerHeight / 2) * 0.7;

  clearDrawing();
  const polygon = utils.getPolygonOfIndex(current_shape, polygon_center, polygon_size);
  const success = utils.drawPolygonClaycode(
    current_tree,
    polygon
  );
  utils.updateInfoText(
    null,
    current_tree,
    success ? "" : "- Failed to Pack :("
  );
}

let SHAPES = [
  // [num_edges, scale, rotation_deg]
  [4, new PIXI.Vec(1, 1), 45],
  [4, new PIXI.Vec(1, 1), 0],
  [4, new PIXI.Vec(1.5, 0.7), 45],
  [4, new PIXI.Vec(0.7, 1.5), 45],
  [8, new PIXI.Vec(1, 1), 0],
  [50, new PIXI.Vec(1, 1), 0],
  [3, new PIXI.Vec(1, 1), 0],
];
let current_shape = 0;

// Helper function to avoid too many calls to the drawing function
// by fast-repeating keystrokes
let timerId;
function debounce(func, delay) {
  infoText.textContent = `Packing...`;
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
}

document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    current_shape = (current_shape + 1) % utils.POLYGON_SHAPES.length;
    debounce(polygonView, 100);
  }
  if (event.key == " ") {
    debounce(polygonView, 100);
  }
});

polygonView();

inputTreeTopology.addEventListener("input", () => debounce(polygonView, 100));
inputNumFragments.addEventListener("input", () => debounce(polygonView, 100));
inputNumNodes.addEventListener("input", () => {
  inputTreeTopology.value = ""
  debounce(polygonView, 100);
});
window.onresize = function () {
  debounce(polygonView, 50);
};
