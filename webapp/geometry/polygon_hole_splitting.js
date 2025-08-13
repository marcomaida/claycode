/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { drawPolygonsWithColors } from "../image_processing/util.js";

// Convert polygons to martinez format
// Input: [{ x: Number, y: Number }, ...]
// Output: [ [ [x, y], ... ] ]
function toMartinez(poly) {
    // Assert the polygon is closed
    console.assert(poly.length > 1, "Input polygon must have at least 2 points");
    const first = poly[0];
    const last = poly[poly.length - 1];
    console.assert(
        first.x === last.x && first.y === last.y,
        "Input polygon must be closed (first and last point equal)"
    );
    return [poly.map(pt => [pt.x, pt.y])];
}

// Input: [ [ [x, y], ... ] ]
// Output: [{ x: Number, y: Number }, ...]
function fromMartinez(mtz) {
    // mtz is array of rings: [ [ [x, y], ... ] ]
    console.assert(Array.isArray(mtz));
    console.assert(mtz.length == 1); // Only one ring
    return mtz.map(ring => ring.map(([x, y]) => ({ x, y })));
}

// Check if innerPoly is fully inside outerPoly
function isPolygonInside(innerPoly, outerPoly, debug = false) {
    if (debug) {
        console.log("Checking polygons:");
        console.log("innerPoly:", innerPoly, "length:", innerPoly.length);
        console.log("outerPoly:", outerPoly, "length:", outerPoly.length);
    }

    // All points of innerPoly inside outerPoly
    let result = innerPoly.every(pt => {
        let x = pt.x, y = pt.y;
        let inside = false;
        for (let i = 0, j = outerPoly.length - 1; i < outerPoly.length; j = i++) {
            let xi = outerPoly[i].x, yi = outerPoly[i].y;
            let xj = outerPoly[j].x, yj = outerPoly[j].y;
            let intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    });

    if (debug) {
        console.log("Is polygon A is inside B:", result);
    }
    return result;
}

/**
 * Subtracts a contained polygon from a container polygon and splits the result to avoid leaving holes.
 *
 * This function finds the closest vertex of the container to the center of the contained polygon,
 * then constructs a thin rectangle (split line) from the contained polygon's center to that vertex.
 * That rectangle is then subtracted from the container polygon to split it, removing the hole.
 * Finally, the contained polygon is also subtracted from the container.
 */
function subtractEnclosedPolygon(container, contained, debug = false) {
    // Compute center of contained polygon
    let cx = 0, cy = 0;
    for (const pt of contained) {
        cx += pt.x;
        cy += pt.y;
    }
    cx /= contained.length;
    cy /= contained.length;

    // Find closest vertex of container to center
    let minDist = Infinity;
    let closestIdx = -1;
    for (let i = 0; i < container.length; i++) {
        const dx = container[i].x - cx;
        const dy = container[i].y - cy;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
        }
    }
    const closestVertex = container[closestIdx];

    // Create a rectangle along the line from center to closest vertex
    // thickness: how wide the rectangle is (perpendicular to the line)
    // stickOut: how much the rectangle sticks out past the closest vertex
    const thickness = 0.9; // Tune this value for rectangle width
    const stickOut = 0.9;  // Tune this value for how much it sticks out
    const dx = closestVertex.x - cx;
    const dy = closestVertex.y - cy;
    const norm = Math.sqrt(dx * dx + dy * dy);
    // Perpendicular vector (normalized)
    const perpX = -dy / norm;
    const perpY = dx / norm;

    // Start and end points of the line
    const startX = cx;
    const startY = cy;
    const endX = closestVertex.x + (dx / norm) * stickOut;
    const endY = closestVertex.y + (dy / norm) * stickOut;

    // Four corners of the rectangle
    const p1 = [startX + perpX * thickness / 2, startY + perpY * thickness / 2];
    const p2 = [startX - perpX * thickness / 2, startY - perpY * thickness / 2];
    const p3 = [endX - perpX * thickness / 2, endY - perpY * thickness / 2];
    const p4 = [endX + perpX * thickness / 2, endY + perpY * thickness / 2];
    const splittingRect = [[p1, p2, p3, p4, p1]];

    // Convert splittingRect to array of {x, y} objects for drawPolygon
    const rectPoints = splittingRect[0].map(([x, y]) => ({ x, y }));

    if (debug) {
        drawPolygonsWithColors([rectPoints], 0xff0080); // Draw the split rectangle in pink
        console.log("splitting rectangle:", JSON.stringify(rectPoints));
    }

    // Remove the contained polygon from the container
    let diff = window.martinez.diff(toMartinez(container), toMartinez(contained));
    console.assert(diff.length == 1, "Expected only one polygon after diff");

    // Remove the "splitting" rectangle from the diff
    diff = window.martinez.diff(diff[0], splittingRect);
    console.assert(diff.length == 1, "Expected only one polygon after diff");
    if (debug) {
        console.log("martinez.diff result:", JSON.stringify(diff[0]));
    }

    return fromMartinez(diff[0]);
}

// Given an array of polygons, subtract all contained polygons from their containers,
// and split the container to not leave holes. Check each pair in both directions.
// Note: Expected polygons are in the format {x : Number, y : Number}, not PIXI.Vec
export function subtractAllEnclosedPolygons(polygons, debug = false) {
    let toProcess = polygons.slice();
    let resultPolygons = [];

    if (debug) {
        drawPolygonsWithColors(toProcess);
    }

    while (toProcess.length > 0) {
        if (debug) {
            console.log("Current toProcess polygons:", toProcess.map(p => p.length));
        }

        let poly = toProcess.shift();
        let found = false;
        for (let i = 0; i < toProcess.length; i++) {
            let container = null, contained = null, removeIdx = null;
            if (isPolygonInside(poly, toProcess[i], debug)) {
                container = toProcess[i];
                contained = poly;
                removeIdx = i; // Remove container
            } else if (isPolygonInside(toProcess[i], poly, debug)) {
                container = poly;
                contained = toProcess[i];
                removeIdx = i; // Remove contained
            }

            if (container && contained) {
                let splitPolys = subtractEnclosedPolygon(container, contained, debug);
                toProcess.splice(removeIdx, 1);
                toProcess.push(...splitPolys);
                found = true;
                break;
            }
        }

        if (!found) {
            resultPolygons.push(poly);
        }
    }
    return resultPolygons;
}