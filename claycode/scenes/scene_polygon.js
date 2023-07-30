import {} from "../geometry/vector.js";
import { area } from "../geometry/geometry.js";
import {} from "../geometry/math.js";
import { TreeNode } from "../tree/tree_node.js";
import { Tree } from "../tree/tree.js";
import { clearDrawing, initDrawing } from "../drawing/draw.js";
import { drawClaycode } from "../drawing/draw_polygon_claycode.js";
import { bitsToTree } from "../conversion/converter.js";
import { BitStreamText } from "../conversion/bit_stream.js";
import { circlePolygon, scalePolygon } from "../geometry/geometry.js";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: 1,
  antialias: true,
});
initDrawing(app);

const inputTextBox = document.getElementById("inputText");
const infoText = document.getElementById("infoText");
inputTextBox.select();
inputTextBox.focus();

document.body.appendChild(app.view);

let polygon_view_last_padding = 0;
let polygon_view_last_text = "";

function debugTree() {
  return new Tree(
    new TreeNode(null, [
      new TreeNode(null, [
        new TreeNode(),
        new TreeNode(),
        new TreeNode(),
        new TreeNode(),
        new TreeNode(),
        new TreeNode(),
      ]),
    ])
  );
}

function polygonView(inputText) {
  var inputText = document.getElementById("inputText").value;
  const last_text_is_prefix =
    inputText.length > 0 &&
    polygon_view_last_text.length > 0 &&
    inputText.startsWith(polygon_view_last_text);
  polygon_view_last_text = inputText;

  var stream = new BitStreamText(inputText);
  let current_tree = bitsToTree(stream);

  // DEBUG
  // current_tree = debugTree();

  infoText.textContent = `Nodes: ${current_tree.root.numDescendants}`;

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
  const MAX_TRIES = 100;
  let tries = 0;

  // Start with large padding, decrease at each fail
  let baseline_padding = Math.lerp(
    20,
    2,
    Math.min(current_tree.root.numDescendants, 300) / 300
  );

  let node_padding_max = last_text_is_prefix
    ? polygon_view_last_padding
    : baseline_padding;
  let node_padding_min = 2;

  while (tries < MAX_TRIES) {
    // Decrease padding if it keeps failing
    const padding = Math.lerp(
      node_padding_max,
      node_padding_min,
      tries / MAX_TRIES
    );
    polygon_view_last_padding = padding;
    current_tree.compute_weights(padding);

    let min_node_area = area(polygon) * 0.001;

    try {
      clearDrawing();
      drawClaycode(current_tree.root, polygon, padding, min_node_area);
      break;
    } catch (error) {
      tries++;
      if (tries == MAX_TRIES) {
        clearDrawing();
        break;
      }
    }
  }
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

document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    current_shape = (current_shape + 1) % SHAPES.length;
    polygonView();
  }
});

// Helper function to avoid too many calls to the drawing function
// by fast-repeating keystrokes
let timerId;
function debounce(func, delay) {
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
}

polygonView();
inputTextBox.addEventListener("input", () => debounce(polygonView, 100));
window.onresize = function () {
  debounce(polygonView, 50);
};
