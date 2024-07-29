import { } from "../geometry/vector.js";
import { area } from "../geometry/geometry.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { circlePolygon } from "../geometry/geometry.js";
import { updateInfoText, initInfoText, initPIXI } from "./utils.js";
import { Tree } from "../tree/tree.js";
import { generateRandomTree, duplicateTreeNTimes } from "../tree/util.js"

const app = initPIXI();
const infoText = initInfoText();
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

  let infoSuffix = ``;

  const window_width = window.innerWidth;
  const window_height = window.innerHeight;

  const shorter = Math.min(window_width / 2, window_height / 2);
  let polygon = circlePolygon(
    new PIXI.Vec(window_width / 2, window_height / 2),
    shorter * 0.7,
    SHAPES[current_shape][0],
    SHAPES[current_shape][1],
    SHAPES[current_shape][2]
  );

  // Try to draw for a certain max number of times
  const MAX_TRIES = 400;
  let tries = 0;

  // Start with large padding, decrease at each fail
  let baseline_padding = Math.lerp(
    20,
    2,
    Math.min(current_tree.root.numDescendants, 300) / 300
  );

  let node_padding_max = baseline_padding;
  let node_padding_min = 2;

  while (tries < MAX_TRIES) {
    // Decrease padding if it keeps failing
    const padding = Math.lerp(
      node_padding_max,
      node_padding_min,
      tries / MAX_TRIES
    );
    current_tree.compute_weights(padding);

    let min_node_area = area(polygon) * 0.0002;

    try {
      clearDrawing();
      drawClaycode(current_tree.root, polygon, padding, min_node_area);
      break;
    } catch (error) {
      tries++;
      if (tries == MAX_TRIES) {
        clearDrawing();
        infoSuffix += "- Failed to Pack :(";
        break;
      }
    }
  }

  updateInfoText(null, current_tree, infoSuffix);
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
    current_shape = (current_shape + 1) % SHAPES.length;
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
