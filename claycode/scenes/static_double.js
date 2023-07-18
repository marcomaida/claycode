import { } from "../geometry/vector.js"
import { } from "../geometry/math.js"
import { clearDebug, initDebug } from "../drawing/debug.js"
import { drawClaycode } from "../drawing/draw_claycode.js"
import { bitsToTree } from "../conversion/converter.js"
import { BitStreamText } from "../conversion/bit_stream.js"

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 1
})
initDebug(app)

const inputTextBox = document.getElementById("inputText")
inputTextBox.select()
inputTextBox.focus()

document.body.appendChild(app.view)

function doubleView() {
    var inputText = document.getElementById("inputText").value
    var stream = new BitStreamText(inputText)
    let current_tree = bitsToTree(stream)

    const window_width = window.innerWidth
    const window_height = window.innerHeight

    const shorter = Math.min(window_width, window_height)
    var bar_width = shorter / 2
    var bar_height = shorter / 2

    const bar_left = window_width / 2 - bar_width / 2
    var bar_top = window_height / 2 - bar_height / 1.2

    const code_frame_square = [new PIXI.Vec(bar_left, bar_top),
        new PIXI.Vec(bar_left + bar_width, bar_top),
        new PIXI.Vec(bar_left + bar_width, bar_top + bar_height),
        new PIXI.Vec(bar_left, bar_top + bar_height)]

    bar_top += bar_height+15
    bar_height /= 2.5

    const code_frame_rect = [new PIXI.Vec(bar_left, bar_top),
        new PIXI.Vec(bar_left + bar_width, bar_top),
        new PIXI.Vec(bar_left + bar_width, bar_top + bar_height),
        new PIXI.Vec(bar_left, bar_top + bar_height)]

    clearDebug();
    drawClaycode(current_tree.root, code_frame_square)
    drawClaycode(current_tree.root, code_frame_rect)
}

doubleView()
inputTextBox.addEventListener('input', doubleView)
window.onresize = function() {
    doubleView()
}