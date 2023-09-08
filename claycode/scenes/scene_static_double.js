import { } from "../geometry/vector.js"
import { } from "../geometry/math.js"
import { clearDrawing } from "../packer/draw.js"
import { drawClaycode } from "../packer/draw_rectangle_claycode.js"
import { textToTree } from "../conversion/convert.js";
import { initInfoText, initInputText, initPIXI, updateInfoText } from "./utils.js";

const app = initPIXI();
const inputTextBox = initInputText();
const infoText = initInfoText();

function doubleView() {
    var inputText = document.getElementById("inputText").value
    let current_tree = textToTree(inputText)

    const window_width = window.innerWidth
    const window_height = window.innerHeight

    const shorter = Math.min(window_width, window_height)
    var bar_width = shorter / 2
    var bar_height = shorter / 2.3

    const bar_left = window_width / 2 - bar_width / 2
    var bar_top = window_height / 2 - bar_height / 1.2

    const code_frame_square = [new PIXI.Vec(bar_left, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top + bar_height),
    new PIXI.Vec(bar_left, bar_top + bar_height)]

    bar_top += bar_height + 15
    bar_height /= 2.5

    const code_frame_rect = [new PIXI.Vec(bar_left, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top),
    new PIXI.Vec(bar_left + bar_width, bar_top + bar_height),
    new PIXI.Vec(bar_left, bar_top + bar_height)]

    clearDrawing();
    drawClaycode(current_tree.root, code_frame_square)
    drawClaycode(current_tree.root, code_frame_rect)

    updateInfoText(inputText, current_tree);
}

doubleView()
inputTextBox.addEventListener('input', doubleView)
window.onresize = function () {
    doubleView()
}
