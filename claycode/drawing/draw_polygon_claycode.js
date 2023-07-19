import { drawPolygon } from "./draw.js"
import { padPolygon } from "../geometry/geometry.js"

const BLACK = 0x000000
const WHITE = 0xFFFFFF

function inverse_color(color) {
    if (color === WHITE)
        return BLACK
    else
        return WHITE
}

export function drawClaycode(node, polygon, color=WHITE) {
    drawPolygon(polygon, color)

    for (let c of node.children) {
        drawClaycode(c, padPolygon(polygon, 5), inverse_color(color))
    }
}