import { drawPolygon } from "./draw.js"
import { padPolygon } from "../geometry/geometry.js"
import { partitionPolygon } from "../geometry/polygon_partition.js"

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

    const sub_polygon = padPolygon(polygon, 3)
    const weights = Math.normalise(node.children.map((c) => c.numDescendants))
    const partition = partitionPolygon(polygon, weights)       
    
    console.assert(partition.length == node.children.length)
    for (const [i, c] of node.children.entries()) {
        drawClaycode(c, partition[i], inverse_color(color))
    }
}