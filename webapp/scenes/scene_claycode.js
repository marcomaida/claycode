import { } from "../geometry/vector.js";
import { } from "../geometry/math.js";
import { textToTree } from "../conversion/convert.js";
import * as utils from "./utils.js";
import { packClaycode } from "../packer/pack.js";
import { clearDrawing } from "../packer/draw.js";
import { duplicateTreeNTimes } from "../tree/util.js";

// Update function
function polygonView() {
  let inputText = document.getElementById("inputText").value;
  if (inputText === "") {
    inputText = " ";
  }

  let current_tree = textToTree(inputText);
  current_tree = duplicateTreeNTimes(current_tree, inputRedundancy.value);

  const polygon_center = new PIXI.Vec(
    app.screen.width * 0.5,
    app.screen.height * 0.5
  );
  const polygon_size =
    Math.min(app.screen.width * 0.5, app.screen.height * 0.5);

  clearDrawing();
  const polygon = utils.getPolygonOfIndex(current_shape, polygon_center, polygon_size);
  const success = utils.drawPolygonClaycode(
    current_tree,
    polygon
  );
  utils.updateInfoText(
    inputText,
    current_tree,
    success ? "" : "- Failed to Pack :("
  );
}

let app;
let current_shape = 0;
let inputRedundancy;
let inputRedundancyContainer;

// Setup
window.addEventListener("DOMContentLoaded", async () => {
  await utils.showChangeShapeLabel(true);
  const inputTextBox = await utils.initInputText();
  utils.initInfoText();
  app = utils.initPIXI();

  inputRedundancy = document.getElementById("inputRedundancy");
  inputRedundancyContainer = document.getElementById("inputRedundancyContainer");
  inputRedundancyContainer.style.visibility = "visible";

  // Shape change management
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
  inputRedundancy.addEventListener("input", () => utils.debounce(polygonView, 100));


  // Add event listener to download button
  const downloadButtonContainer = document.getElementById("downloadButtonContainer");
  downloadButtonContainer.style.visibility = "visible";
  document.getElementById("downloadButton").addEventListener("click", function () { utils.downloadClaycode(app) });

});

