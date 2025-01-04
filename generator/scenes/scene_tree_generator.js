import { } from "../geometry/vector.js";
import { area } from "../geometry/geometry.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { createCirclePolygon } from "../geometry/shapes.js";
import * as utils from "./utils.js";
import { Tree } from "../tree/tree.js";
import { TreeNode } from "../tree/tree_node.js";

await utils.showChangeShapeLabel(true);
const app = utils.initPIXI();
const infoText = utils.initInfoText();
const inputMaxChildren = document.getElementById("inputMaxChildren");
const inputMaxHeight = document.getElementById("inputMaxHeight");
const inputGrowProb = document.getElementById("inputGrowProb");

function generateRandomTree(
  maxChildren,
  maxHeight,
  growProbability,
  remainingNodes
) {
  function _gen(
    node,
    maxChildren,
    maxHeight,
    growProbability,
    height,
    remainingNodes
  ) {
    if (height > maxHeight) {
      return remainingNodes;
    }
    for (let i = 0; i < maxChildren; i++) {
      if (Math.random() <= growProbability) {
        if (remainingNodes <= 0) {
          return remainingNodes;
        }

        let child = new TreeNode(node, []);
        remainingNodes = _gen(
          child,
          maxChildren,
          maxHeight,
          growProbability,
          height + 1,
          remainingNodes - 1
        );
        node.children.push(child);
      }
    }

    return remainingNodes;
  }

  const root = new TreeNode(null, []);
  _gen(root, maxChildren, maxHeight, growProbability, 1, remainingNodes - 2);
  console.log(root.children.length);
  return new Tree(root);
}

function polygonView() {
  let maxNodes = 1000;
  let current_tree = generateRandomTree(
    inputMaxChildren.value,
    inputMaxHeight.value,
    inputGrowProb.value,
    maxNodes
  );
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
inputMaxChildren.addEventListener("input", () => debounce(polygonView, 100));
inputMaxHeight.addEventListener("input", () => debounce(polygonView, 100));
inputGrowProb.addEventListener("input", () => debounce(polygonView, 100));
window.onresize = function () {
  debounce(polygonView, 50);
};
