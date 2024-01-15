import {} from "../geometry/vector.js";
import {} from "../geometry/math.js";
import { clearDrawing, initDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_rectangle_claycode.js";
import { textToTree } from "../conversion/convert.js";
import * as util from "./utils.js";

// Oscillation
function smoothOscillation(min, max, duration_s, oscillation_fun) {
  const amplitude = (max - min) / 2;
  const center = min + amplitude;
  const t = (Date.now() / 1000 / duration_s) * 2 * Math.PI;
  const oscillation = center + amplitude * oscillation_fun(t);
  return oscillation;
}

function updateDrawing() {
  const d = new Date();

  const anim_cycle_s = 6;
  const min_div = 10;
  const max_div = 1.6;
  var bar_width = smoothOscillation(
    window.innerWidth / min_div,
    window.innerWidth / max_div,
    anim_cycle_s,
    (x) => Math.sin(x)
  );
  var bar_height = smoothOscillation(
    window.innerHeight / min_div,
    window.innerHeight / max_div,
    anim_cycle_s,
    (x) => Math.sin(x - Math.PI)
  );

  const bar_left = window.innerWidth / 2 - bar_width / 2;
  var bar_top = window.innerHeight / 2 - bar_height / 2;

  const code_frame_square = [
    new PIXI.Vec(bar_left, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top + bar_height),
    new PIXI.Vec(bar_left, bar_top + bar_height),
  ];

  clearDrawing();
  drawClaycode(current_tree.root, code_frame_square);
}

function updateClaycode() {
  let inputText = document.getElementById("inputText").value;
  if (inputText === "") {
    inputText = " ";
  }

  current_tree = textToTree(inputText);

  current_ticker = (delta) => {
    updateDrawing();
  };
  app.ticker.add(current_ticker);

  util.updateInfoText(inputText, current_tree);
}

// Setup
await util.showChangeShapeLabel(false);
const app = util.initPIXI();
const inputTextBox = await util.initInputText();
var current_tree = null;
var current_ticker = null;
updateClaycode();
inputTextBox.addEventListener("input", updateClaycode);
window.onresize = function () {
  updateClaycode();
};
