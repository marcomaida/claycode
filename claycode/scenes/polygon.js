import { } from "../geometry/vector.js"
import { } from "../geometry/math.js"
import { clearDrawing, initDrawing } from "../drawing/draw.js"
import { drawClaycode } from "../drawing/draw_polygon_claycode.js"
import { bitsToTree } from "../conversion/converter.js"
import { BitStreamText } from "../conversion/bit_stream.js"
import { circlePolygon } from "../geometry/geometry.js"

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 1
})
initDrawing(app)

const inputTextBox = document.getElementById("inputText")
inputTextBox.select()
inputTextBox.focus()

document.body.appendChild(app.view)

function polygonView() {
    var inputText = document.getElementById("inputText").value
    var stream = new BitStreamText(inputText)
    let current_tree = bitsToTree(stream)

    const window_width = window.innerWidth
    const window_height = window.innerHeight

    const shorter = Math.min(window_width/2, window_height/2)
    let polygon = circlePolygon( new PIXI.Vec(window_width/2, window_height/2), shorter*.7, 100)

    clearDrawing();
    drawClaycode(current_tree.root, polygon)
}

polygonView()
inputTextBox.addEventListener('input', polygonView)
window.onresize = function() {
    polygonView()
}