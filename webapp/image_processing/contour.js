/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { closeSmallIslands, closeSmallEmptyGaps, drawPolygonsWithColors, openPolygon, closePolygon, toMartinez, fromMartinez } from "./util.js";
import { area } from "../geometry/geometry.js";
import "./simplify.js"

const EMPTY = 0;
const FULL = 1;
const CONTOUR = 2;
const VISITED = -1;
const cardinalDirections = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Used for neighbors
const allDirections = cardinalDirections.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]); // Used for touching

const debug = false; // Set to true to enable debugging drawings for polygons and logs

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

// Helper: check if polyA is fully inside polyB
function isPolygonInside(polyA, polyB) {
    if (debug) {
        console.log("Checking polygons:");
        console.log("polyA:", polyA, "length:", polyA.length);
        console.log("polyB:", polyB, "length:", polyB.length);
    }

    // All points of polyA inside polyB
    let result = polyA.every(pt => {
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

    if (debug) {
        console.log("Is polygon A is inside B:", result);
    }
    return result;
}

// Subtract contained polygon from container and split result
function subtractEnclosedPolygon(container, contained) {
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
function subtractAllEnclosedPolygons(polygons) {
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
                let splitPolys = subtractEnclosedPolygon(container, contained);
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

// Filter out polygons with area smaller than a percentage of the total image area
function filterSmallPolygons(polygons, binaryImage, minAreaPerc = 0.01) {
    const totalImageArea = binaryImage.length * binaryImage[0].length;
    const minPolygonArea = totalImageArea * minAreaPerc;
    const filtered = polygons.filter(poly => area(poly) >= minPolygonArea);

    if (debug) {
        console.log(`Created ${filtered.length} final polygons`);
        console.log("-----------------------");
    }
    return filtered;
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

    // IMPORTANT: The martinez library assumes that polygons are closed
    // But the packer assumes that polygons are open
    // So we close them first, then open them again
    polygons = polygons.map((poly) => closePolygon(simplify(poly, 3, false)));

    // Subtract contained polygons from containing polygons, splitting the container to not leave holes
    let resultPolygons = subtractAllEnclosedPolygons(polygons);

    // IMPORTANT: Re-open the polygon for the packer to work
    resultPolygons = resultPolygons.map((poly) => openPolygon(simplify(poly, 3, false)));
    let pixiPolygons = posArraysToPixiVecArrays(resultPolygons, center, size);

    // Last safety measure: filter out polygons with a very small area
    pixiPolygons = filterSmallPolygons(pixiPolygons, binaryImage, 0.01);

    return pixiPolygons;
}
