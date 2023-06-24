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

var current_tree = null
var current_ticker = null

function smoothOscillation(min, max, duration_s, oscillation_fun) {
    const amplitude = (max - min) / 2;
    const center = min + amplitude
    const t = Date.now() / 1000. / duration_s * 2. * Math.PI
    const oscillation = center + amplitude * oscillation_fun(t)
    return oscillation
}

function updateDrawing() {
    const d = new Date();
    let ms = d.getMilliseconds();
    
    const anim_cycle_s = 6
    const min_div = 10
    const max_div = 1.6
    var bar_width = smoothOscillation(window.innerWidth/min_div, window.innerWidth/max_div, anim_cycle_s, (x)=>Math.sin(x))
    var bar_height = smoothOscillation(window.innerHeight/min_div, window.innerHeight/max_div, anim_cycle_s, (x)=>Math.sin(x-Math.PI))

    const bar_left = window.innerWidth / 2 - bar_width / 2
    var bar_top = window.innerHeight / 2 - bar_height / 2

    const code_frame_square = [new PIXI.Vector(bar_left, bar_top),
        new PIXI.Vector(bar_left + bar_width, bar_top),
        new PIXI.Vector(bar_left + bar_width, bar_top + bar_height),
        new PIXI.Vector(bar_left, bar_top + bar_height)]

    clearDebug();
    drawClaycode(current_tree.root, code_frame_square)
}

function updateClaycode() {
    var inputText = document.getElementById("inputText").value
    var stream = new BitStreamText(inputText)
    current_tree = bitsToTree(stream)

    current_ticker = (delta) => {
        updateDrawing()
    }
    app.ticker.add(current_ticker)
}

updateClaycode()
inputTextBox.addEventListener('input', updateClaycode)
window.onresize = function() {
    updateClaycode()
}