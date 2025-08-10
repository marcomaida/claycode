/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { closeSmallIslands, closeSmallEmptyGaps } from "./util.js";
import { area } from "../geometry/geometry.js";
import { drawPolygon } from "../packer/draw.js";
import "./simplify.js"

const EMPTY = 0;
const FULL = 1;
const CONTOUR = 2;
const VISITED = -1;
const cardinalDirections = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Used for neighbors
const allDirections = cardinalDirections.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]); // Used for touching

function getNeighbors(mat, row, col, directions) {
    let ret = [];
    if (row < 0 || col < 0 || row >= mat.length || col >= mat[0].length) return ret;

    for (const [i, j] of directions) {
        if (row + i < 0 || col + j < 0 || row + i >= mat.length || col + j >= mat[0].length) {
            continue;
        }
        ret.push([row + i, col + j]);
    }

    return ret;
}

function addPadding(binaryImage) {
    if (binaryImage.length === 0) return binaryImage;
    const numRows = binaryImage.length;
    const numCols = binaryImage[0].length;
    const paddedMatrix = [];

    // Create top border
    paddedMatrix.push(new Array(numCols + 2).fill(FULL));

    // Add padding to each row of the original matrix
    for (let i = 0; i < numRows; i++) {
        paddedMatrix.push([FULL, ...binaryImage[i], FULL]);
    }

    // Create bottom border
    paddedMatrix.push(new Array(numCols + 2).fill(FULL));

    return paddedMatrix;
}

function fill(matrix, row, col) {
    let mat = matrix;
    let queue = [[row, col]];

    while (queue.length > 0) {
        let [i, j] = queue.shift();
        if (getNeighbors(mat, i, j, allDirections).some(
            ([adjRow, adjCol]) => mat[adjRow][adjCol] == FULL)
        ) {
            mat[i][j] = CONTOUR;
            continue;
        }

        getNeighbors(mat, i, j, cardinalDirections).forEach(
            ([adjRow, adjCol]) => {
                if (mat[adjRow][adjCol] == EMPTY) {
                    queue.push([adjRow, adjCol]);
                    mat[adjRow][adjCol] = VISITED;
                }
            }
        );
        mat[i][j] = VISITED;
    }

    return mat;
}

function markContours(binaryImage) {
    const numRows = binaryImage.length;
    const numCols = binaryImage[0].length;
    let markedMatrix = binaryImage;

    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            if (markedMatrix[row][col] != EMPTY) {
                continue;
            }
            if (getNeighbors(markedMatrix, row, col, allDirections).every(
                ([i, j]) => markedMatrix[i][j] == EMPTY)
            ) {
                // Only process starting from a pixel "0" surrounded by all zeroes
                markedMatrix = fill(markedMatrix, row, col);
            }
        }
    }

    return markedMatrix;
}

// Returns array of polygons in the format {x : Number, y : Number}
function extractPolygonsFromContours(contouredBinaryImage) {
    let ret = [];
    const numRows = contouredBinaryImage.length;
    const numCols = contouredBinaryImage[0].length;
    let mat = contouredBinaryImage;

    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            var currRow = row, currCol = col;
            let polygon = [];

            // Follow this contour
            while (mat[currRow][currCol] == CONTOUR) {
                let neighboringContours = getNeighbors(mat, currRow, currCol, allDirections).filter(
                    ([i, j]) => mat[i][j] == CONTOUR
                );

                // Ensure conotour can be followed
                if (currRow == row && currCol == col) {
                    console.assert(neighboringContours.length == 2);
                } else {
                    // Warning: this does not guarantee that there won't be branching
                    console.assert(neighboringContours.length <= 2);
                }

                polygon.push({ x: currRow, y: currCol });
                mat[currRow][currCol] = VISITED;
                if (neighboringContours.length > 0) {
                    currRow = neighboringContours[0][0];
                    currCol = neighboringContours[0][1];
                }
            }

            if (polygon.length > 0) {
                ret.push(polygon);
            }
        }
    }

    // TODO Perform this assert on every tuple of points?
    // Ensure last point touches the first point for all polygons
    ret.forEach(
        (poly) => console.assert(
            getNeighbors(mat, poly[0][0], poly[0][1], allDirections).some(
                (point) => point.x == poly[poly.length - 1][0] && point.y == poly[poly.length - 1][1]
            )
        )
    );

    return ret;
}

function posArraysToPixiVecArrays(polygons, center, size) {
    const topLeftX = center.x - size / 2;
    const topLeftY = center.y - size / 2;
    return polygons.map(
        (poly) => poly.map(
            (point) => new PIXI.Vec(topLeftX + point.y, topLeftY + point.x) // Cursed coord flip
        )
    );
}

// Utility: add first point to end if not already closed
function closePolygon(poly) {
    if (poly.length > 0) {
        const first = poly[0];
        const last = poly[poly.length - 1];
        if (first.x !== last.x || first.y !== last.y) {
            poly.push({ ...first });
        }
    }
    return poly;
}

// Utility: remove last point if polygon is closed
function openPolygon(poly) {
    if (poly.length > 1) {
        const first = poly[0];
        const last = poly[poly.length - 1];
        if (first.x === last.x && first.y === last.y) {
            poly.pop();
        }
    }
    return poly;
}

// Convert polygons to martinez format
// Input: [{ x: Number, y: Number }, ...]
// Output: [ [ [x, y], ... ] ]
function toMartinez(poly) {
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

// Helper: check if polyA is fully inside polyB
function isPolygonInside(polyA, polyB) {
    console.log("Checking polygons:");
    console.log("polyA:", polyA, "length:", polyA.length);
    console.log("polyB:", polyB, "length:", polyB.length);
    // All points of polyA inside polyB
    return polyA.every(pt => {
        let x = pt.x, y = pt.y;
        let inside = false;
        for (let i = 0, j = polyB.length - 1; i < polyB.length; j = i++) {
            let xi = polyB[i].x, yi = polyB[i].y;
            let xj = polyB[j].x, yj = polyB[j].y;
            let intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    });
}

// Subtract contained polygon from container and split result
function subtractContainedPolygon(container, contained, hackPoly) {
    // Remove the contained polygon from the container
    let diff = window.martinez.diff(toMartinez(container), toMartinez(contained));
    console.assert(diff.length == 1, "Expected only one polygon after diff");

    // Remove the "splitting" polygon from the diff
    diff = window.martinez.diff(diff[0], hackPoly);
    console.assert(diff.length == 1, "Expected only one polygon after diff");
    console.log("martinez.diff result:", JSON.stringify(diff[0]));

    // Split the polygon into multiple polygons
    return fromMartinez(diff[0]);
}

/*
    Given a binary image, computes a set of non-overlapping polygons that covers the image.
    `size` specifies the size of the image in PIXI's coordinate system.
    Returns an array of arrays of PIXI.Vec point. Each array represents a polygon.
    
    INPUT
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    
    EXPECTED (with padding)
    [1, 1, 1, 1, 1],
    [1, 0, 2, 0, 1],
    [1, 2, -1, 2, 1],
    [1, 0, 2, 0, 1],
    [1, 1, 1, 1, 1],
*/
export function computeContourPolygons(binaryImage, center, size) {
    // Remove noise (small islands of "1"s)
    binaryImage = closeSmallIslands(binaryImage, 0.01, 1);
    // Close small gaps in the contours, effectively padding
    binaryImage = closeSmallEmptyGaps(binaryImage);
    // Remove negative noise (small islands of "0"s) - these could lead to very small polygons
    binaryImage = closeSmallIslands(binaryImage, 0.02, 0);
    binaryImage = addPadding(binaryImage);
    binaryImage = markContours(binaryImage);
    let polygons = extractPolygonsFromContours(binaryImage);

    // IMPORTANT: The library assumes that polygons are closed
    // But the packer assumes that polygons are open
    // So we close them first, then open them again
    polygons = polygons.map((poly) => closePolygon(simplify(poly, 3, false)));

    let hackPoly = [[
        [0, 0],
        [200, 0],
        [200, 200],
        [0, 200],
        [0, 0]
    ]];

    console.log(`hackPoly is ${JSON.stringify(hackPoly)}`);
    // const pts = hackPoly[0].map(([x, y]) => ({ x, y }));
    // drawPolygon(pts, 0xff0080);
    // drawPolygon(fromMartinez(hackPoly), 0xff0080);

    // Subtract contained polygons from containing polygons
    let toProcess = polygons.slice();
    let resultPolygons = [];
    while (toProcess.length > 0) {
        let poly = toProcess.shift();
        let found = false;
        for (let i = 0; i < toProcess.length; i++) {
            let container = null, contained = null, removeIdx = null;
            if (isPolygonInside(poly, toProcess[i])) {
                container = toProcess[i];
                contained = poly;
                removeIdx = i; // Remove container
            } else if (isPolygonInside(toProcess[i], poly)) {
                container = poly;
                contained = toProcess[i];
                removeIdx = i; // Remove contained
            }
            
            if (container && contained) {
                let splitPolys = subtractContainedPolygon(container, contained, hackPoly);
                toProcess.splice(removeIdx, 1);
                toProcess.push(...splitPolys);
                found = true;

                splitPolys.forEach((polygon) => {
                    // Use a set of very bright, distinct colors
                    const brightColors = [
                    0xff0000, // Red
                    0x00ff00, // Green
                    0x0000ff, // Blue
                    0xffff00, // Yellow
                    0xff00ff, // Magenta
                    0x00ffff, // Cyan
                    0xffffff, // White
                    0xff8000, // Orange
                    0x00ff80, // Spring Green
                    0x8000ff, // Purple
                    0xff0080, // Pink
                    0x80ff00, // Chartreuse
                    0x0080ff, // Azure
                    0x80ffff, // Light Cyan
                    0xffff80, // Light Yellow
                    0xff80ff, // Light Magenta
                    0x80ff80, // Light Green
                    0x8080ff, // Light Blue
                    ];
                    splitPolys.forEach((polygon, i) => {
                    const color = brightColors[i % brightColors.length];
                    drawPolygon(polygon, color);
                    });
                    return;
                });

                break;
            }
        }

        if (!found) {
            console.log("Not contained");
            resultPolygons.push(poly);
        }
    }

    // IMPORTANT: Re-open the polygon for the packer to work
    resultPolygons = resultPolygons.map((poly) => openPolygon(simplify(poly, 3, false)));
    let pixiPolygons = posArraysToPixiVecArrays(resultPolygons, center, size);

    // Last safety measure: filter out polygons with a very small area
    const totalImageArea = binaryImage.length * binaryImage[0].length;
    const minAreaPerc = 0.01;
    const minPolygonArea = totalImageArea * minAreaPerc;
    pixiPolygons = pixiPolygons.filter(poly => area(poly) >= minPolygonArea);

    console.log(`Created polygons: len ${pixiPolygons.length}`);
    pixiPolygons.forEach((poly, idx) => {
        console.log(`Polygon ${idx}:`);
        poly.forEach((pt, j) => {
            console.log(`  [${pt.x}, ${pt.y}]`);
        });
    });

    return pixiPolygons;
}
