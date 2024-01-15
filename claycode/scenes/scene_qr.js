import {} from "../geometry/vector.js";
import {} from "../geometry/math.js";
import { textToTree } from "../conversion/convert.js";
import * as utils from "./utils.js";

function updateQR(inputText, size) {
  // Computing height like this due to flexbox apparent bug in taking qrcode's container size
  document.getElementById("qrcode").innerHTML = "";
  new QRCode("qrcode", {
    text: inputText,
    width: size,
    height: size,
    colorDark: "#ffffff",
    colorLight: "#000000",
    correctLevel: QRCode.CorrectLevel.L,
  });
}

// Update function
function polygonView() {
  let inputText = document.getElementById("inputText").value;
  if (inputText === "") {
    inputText = " ";
  }

  // Decide size of QR code
  const parent_height =
    (window.innerHeight -
      document.getElementById("headerDiv").clientHeight -
      document.getElementById("footerDiv").clientHeight) *
    0.65;
  const parent_width =
    document.getElementById("qr-container").clientWidth * 0.9;
  const qr_size = Math.min(parent_height, parent_width);
  updateQR(inputText, qr_size);

  const current_tree = textToTree(inputText);
  const polygon_center = new PIXI.Vec(
    window.innerWidth * 0.25,
    window.innerHeight / 2
  );

  // Since the polygon drawing function draws a regular polygon around a circle,
  // but the qr size is expressed as the side length of the square, we adjust
  // it to be the radius of the enclosing circle, (multiply by `sqrt(2)/2`)
  const polygon_size = (qr_size * 1.41421356) / 2;
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
