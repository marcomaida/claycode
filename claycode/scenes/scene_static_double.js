import { } from "../geometry/vector.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_rectangle_claycode.js";
import { textToTree } from "../conversion/convert.js";
import * as util from "./utils.js";

function doubleView() {
  let inputText = document.getElementById("inputText").value;
  if (inputText === "") { inputText = " "; }

  const current_tree = textToTree(inputText);

  const window_width = window.innerWidth;
  const window_height = window.innerHeight;

  const shorter = Math.min(window_width, window_height);
  const bar_width = shorter / 2;
  let bar_height = shorter / 2.3;

  const bar_left = window_width / 2 - bar_width / 2;
  let bar_top = window_height / 2 - bar_height / 1.3;

  const code_frame_square = [
    new PIXI.Vec(bar_left, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top + bar_height),
    new PIXI.Vec(bar_left, bar_top + bar_height),
  ];

  bar_top += bar_height + 15;
  bar_height /= 2.5;

  const code_frame_rect = [
    new PIXI.Vec(bar_left, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top + bar_height),
    new PIXI.Vec(bar_left, bar_top + bar_height),
  ];

  clearDrawing();
  drawClaycode(current_tree.root, code_frame_square);
  drawClaycode(current_tree.root, code_frame_rect);

  util.updateInfoText(inputText, current_tree);
}


// Setup
util.showChangeShapeLabel(false);
const app = util.initPIXI();
const inputTextBox = await util.initInputText();
const infoText = util.initInfoText();
doubleView();
inputTextBox.addEventListener("input", doubleView);
window.onresize = function () {
  doubleView();
};
