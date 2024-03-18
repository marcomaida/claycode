import {} from "../geometry/vector.js";
import {} from "../geometry/math.js";
import { textToTree } from "../conversion/convert.js";
import * as utils from "./utils.js";

// Update function
function polygonView() {
  let inputText = document.getElementById("inputText").value;
  if (inputText === "") {
    inputText = " ";
  }

  const current_tree = textToTree(inputText);
  const polygon_center = new PIXI.Vec(
    window.innerWidth * 0.5,
    window.innerHeight / 2
  );
  const polygon_size =
    Math.min(window.innerWidth / 2, window.innerHeight / 2) * 0.7;
  const success = utils.drawPolygonClaycode(
    current_tree,
    current_shape,
    polygon_center,
    polygon_size
  );
  utils.updateInfoText(
    inputText,
    current_tree,
    success ? "" : "- Failed to Pack :("
  );
}

// Setup
await utils.showChangeShapeLabel(true);
const app = utils.initPIXI();
const inputTextBox = await utils.initInputText();
utils.initInfoText();

// Shape change management
let current_shape = 0;
document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    current_shape = (current_shape + 1) % utils.POLYGON_SHAPES.length;
    polygonView();
  }
});

// Claycode update logic
let timerId;
polygonView();
inputTextBox.addEventListener("input", () => {
  timerId = utils.debounce(polygonView, 100, timerId);
});
window.onresize = function () {
  timerId = utils.debounce(polygonView, 100, timerId);
};
