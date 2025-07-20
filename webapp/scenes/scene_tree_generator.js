import { } from "../geometry/vector.js";
import { area } from "../geometry/geometry.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { createCirclePolygon } from "../geometry/shapes.js";
import * as utils from "./utils.js";
// Import from common library instead
import { Tree, TreeNode } from "../common/index.js";

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
    app.screen.width * 0.5,
    app.screen.height * 0.5
  );
  const polygon_size =
    Math.min(app.screen.width / 2, app.screen.height / 2) * 0.9;

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

await utils.showChangeShapeLabel(true);
let app;

async function init() {
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }

  app = utils.initPIXI();
  const infoText = utils.initInfoText();
  const inputMaxChildren = document.getElementById("inputMaxChildren");
  const inputMaxHeight = document.getElementById("inputMaxHeight");
  const inputGrowProb = document.getElementById("inputGrowProb");

  polygonView();
  inputMaxChildren.addEventListener("input", () => debounce(polygonView, 100));
  inputMaxHeight.addEventListener("input", () => debounce(polygonView, 100));
  inputGrowProb.addEventListener("input", () => debounce(polygonView, 100));
  window.onresize = function () {
    debounce(polygonView, 50);
  };
};
init();
