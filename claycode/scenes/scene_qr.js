import {} from "../geometry/vector.js";
import {} from "../geometry/math.js";
import { textToTree } from "../conversion/convert.js";
import * as utils from "./utils.js";

function updateQR(input_text, size) {
  // Computing height like this due to flexbox apparent bug in taking qrcode's container size
  document.getElementById("qrcode").innerHTML = "";
  new QRCode("qrcode", {
    text: input_text,
    width: size,
    height: size,
    colorDark: "#ffffff",
    colorLight: "#000000",
    correctLevel: QRCode.CorrectLevel.L,
  });
}

// Update function
function polygonView() {
  let input_text = document.getElementById("inputText").value;
  if (input_text === "") {
    input_text = " ";
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
  updateQR(input_text, qr_size);

  const current_tree = textToTree(input_text);

  // Performance boost handling. Prune text.
  let perf_boost_range = document.getElementById("performanceBoostRange");
  const performance_boost = perf_boost_range.value;
  const boosted_input_length = Math.max(
    Math.round(input_text.length / performance_boost),
    1
  );
  const cut_input_text = input_text.substring(0, boosted_input_length);
  const current_tree_boost = textToTree(cut_input_text);

  // Since the polygon drawing function draws a regular polygon around a circle,
  // but the qr size is expressed as the side length of the square, we adjust
  // it to be the radius of the enclosing circle, (multiply by `sqrt(2)/2`)
  const polygon_size = (qr_size * 1.41421356) / 2;
  const polygon_center = new PIXI.Vec(
    window.innerWidth * 0.25,
    window.innerHeight / 2
  );
  const success = utils.drawPolygonClaycode(
    current_tree_boost,
    current_shape,
    polygon_center,
    polygon_size
  );
  utils.updateInfoText(
    input_text,
    current_tree_boost,
    success ? "" : "- Failed to Pack :("
  );

  // Update performance boost info
  const perf_boost_info = document.getElementById("performanceBoostInfoText");
  if (performance_boost == 1) {
    perf_boost_info.textContent = `No performance boost`;
  } else {
    perf_boost_info.textContent = `${performance_boost}x performance boost | Encoding "${cut_input_text}"`;
  }
  input_text;
}

// Setup
await utils.showChangeShapeLabel(true);
const app = utils.initPIXI();
const input_text_box = await utils.initInputText();
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
input_text_box.addEventListener("input", () => {
  timerId = utils.debounce(polygonView, 100, timerId);
});
window.onresize = function () {
  timerId = utils.debounce(polygonView, 100, timerId);
};
let perf_boost_range = document.getElementById("performanceBoostRange");
perf_boost_range.addEventListener("input", () => {
  timerId = utils.debounce(polygonView, 200, timerId);
});
