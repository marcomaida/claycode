import { } from "../geometry/vector.js"
import { } from "../geometry/math.js"
import { clearDebug, drawDebugPolygon, initDebug } from "../drawing/debug.js"
import { bitsToTree } from "../conversion/converter.js"
import { BitStreamText } from "../conversion/bit_stream.js"

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 1
})
initDebug(app)

const canvasDiv = document.getElementById("canvasDiv")

const inputTextBox = document.getElementById("inputText")
inputTextBox.select()
inputTextBox.focus()

document.body.appendChild(app.view)

const BLACK = 0x000000
const WHITE = 0xFFFFFF

function inverse_color(color) {
    if (color === WHITE)
        return BLACK
    else
        return WHITE
}

function drawTree(node, bar_frame, color) {
    drawDebugPolygon(bar_frame, color)

    if (node.isLeaf()) return;

    /* Bar is expected in the form [top_left, top_right, bottom_right, bottom_left] */
    const bar_width = bar_frame[1].x - bar_frame[0].x
    const bar_height = bar_frame[3].y - bar_frame[0].y

    /* A node should take exactly as much horizontal and vertical space as 1/numDescendants */
    const parent_rel_space = (1 / node.numDescendants) ** (0.65)
    //const parent_rel_space = 1 / (node.tree.maxDepth + 1)

    if (bar_width >= bar_height) {
        // Horizontal layout
        const inter_margin = parent_rel_space * bar_width / (1 + node.children.length) // num of vertical bars
        const side_margin = parent_rel_space * bar_height / 2 // There are always two side margins

        let top_left = bar_frame[0].clone().add(new PIXI.Vector(inter_margin, side_margin))

        for (let c of node.children) {
            const child_weight = c.numDescendants / (node.numDescendants - 1)
            const child_width = bar_width * (1. - parent_rel_space) * child_weight
            const child_height = bar_height * (1. - parent_rel_space)
            var child_frame = [
                top_left.clone(),
                top_left.clone().add(new PIXI.Vector(child_width, 0)),
                top_left.clone().add(new PIXI.Vector(child_width, child_height)),
                top_left.clone().add(new PIXI.Vector(0, child_height))
            ]

            drawTree(c, child_frame, inverse_color(color))
            top_left.add(new PIXI.Vector(child_width + inter_margin, 0))
        }
    }
    else {
        // vertical layout
        const side_margin = parent_rel_space * bar_width / 2 // There are always two side margins
        const inter_margin = parent_rel_space * bar_height / (1 + node.children.length) // num of horizontal bars

        let top_left = bar_frame[0].clone().add(new PIXI.Vector(side_margin, inter_margin))

        for (let c of node.children) {
            const child_weight = c.numDescendants / (node.numDescendants - 1)
            const child_height = bar_height * (1. - parent_rel_space) * child_weight
            const child_width = bar_width * (1. - parent_rel_space)
            var child_frame = [
                top_left.clone(),
                top_left.clone().add(new PIXI.Vector(child_width, 0)),
                top_left.clone().add(new PIXI.Vector(child_width, child_height)),
                top_left.clone().add(new PIXI.Vector(0, child_height))
            ]

            drawTree(c, child_frame, inverse_color(color))
            top_left.add(new PIXI.Vector(0, child_height + inter_margin))
        }
    }
}


function updateCode() {
    var inputText = document.getElementById("inputText").value
    var stream = new BitStreamText(inputText)
    let current_tree = bitsToTree(stream)

    const window_width = window.innerWidth
    const window_height = window.innerHeight

    const shorter = Math.min(window_width, window_height)
    const bar_width = shorter / 1.5
    const bar_height = shorter / 1.5

    const bar_left = window_width / 2 - bar_width / 2
    const bar_top = window_height / 2 - bar_height / 2

    var bar_frame = [new PIXI.Vector(bar_left, bar_top),
    new PIXI.Vector(bar_left + bar_width, bar_top),
    new PIXI.Vector(bar_left + bar_width, bar_top + bar_height),
    new PIXI.Vector(bar_left, bar_top + bar_height)]

    clearDebug()
    drawTree(current_tree.root, bar_frame, WHITE)
}

inputTextBox.addEventListener('input', updateCode)

updateCode()
