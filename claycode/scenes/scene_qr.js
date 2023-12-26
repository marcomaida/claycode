import { } from "../geometry/vector.js";
import { } from "../geometry/math.js";
import { textToTree } from "../conversion/convert.js";
import * as utils from "./utils.js";

// Setup
const app = utils.initPIXI();
const inputTextBox = utils.initInputText();
utils.initInfoText();
var qr_code = new QRCode("qrcode", {
  text: "",
  colorDark: "#ffffff",
  colorLight: "#000000",
  correctLevel: QRCode.CorrectLevel.L
});

// Update function
function polygonView() {
  const inputText = document.getElementById("inputText").value;
  qr_code.clear();
  qr_code.makeCode(inputText,);

  const current_tree = textToTree(inputText);
  const polygon_center = new PIXI.Vec(window.innerWidth / 3, window.innerHeight / 2)
  const polygon_size = Math.min(window.innerWidth / 2, window.innerHeight / 2) * 0.7;
  const success = utils.drawPolygonClaycode(current_tree, current_shape, polygon_center, polygon_size);
  utils.updateInfoText(inputText, current_tree, success ? "" : "- Failed to Pack :(");
}

// Shape change management
let current_shape = 0;
document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    current_shape = (current_shape + 1) % POLYGON_SHAPES.length;
    polygonView();
  }
});

// Claycode update logic
let timerId;
polygonView();
inputTextBox.addEventListener("input", () => { timerId = utils.debounce(polygonView, 100, timerId) });
window.onresize = function () { timerId = utils.debounce(polygonView, 100, timerId); };

