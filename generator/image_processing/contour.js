// Given a binary image, computes a set of non-overlapping polygons that covers the image.
// `size` specifies the size of the image in PIXI's coordinate system.
//
// Returns an array of arrays of PIXI.Vec point. Each array represents a polygon.

import { closeSmallIslands } from "./util.js";
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

/*
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
    binaryImage = closeSmallIslands(binaryImage, 0.01);
    binaryImage = addPadding(binaryImage);
    binaryImage = markContours(binaryImage);
    let polygons = extractPolygonsFromContours(binaryImage);
    polygons = polygons.map((poly) => simplify(poly, 1, false));
    let pixiPolygons = posArraysToPixiVecArrays(polygons, center, size);

    return pixiPolygons;
}
