// Given a binary image, computes a set of non-overlapping polygons that covers the image.
// `size` specifies the size of the image in PIXI's coordinate system.
//
// Returns an array of arrays of PIXI.Vec point. Each array represents a polygon.

const EMPTY = 0;
const FULL = 1;
const CONTOUR = 2;
const VISITED = -1;
const cardinalDirections = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Used for neighbors
const allDirections = cardinalDirections.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]); // Used for touching

function getNeighbors(mat, row, col, directions)
{
    let ret = [];
    if (row < 0 || col < 0 || row >= mat.length || col >= mat[0].length) return ret;

    for (const [i, j] of directions) {
        if (row+i < 0 || col+j < 0 || row+i >= mat.length || col+j >= mat[0].length) {
            continue;
        }
        ret.push([row+i, col+j]);
    }

    return ret;
}

function addPadding(binaryImage)
{
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

function fill(matrix, row, col)
{
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
                if (mat[adjRow][adjCol] == EMPTY) queue.push([adjRow, adjCol])
            }
        );
        mat[i][j] = VISITED;
    }

    return mat;
}

function markContous(binaryImage)
{
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
                markedMatrix = fill(markedMatrix, row, col) 
            }
        }
    }

    return markedMatrix;
}

// Respect simplify.js format of {x : Number, y : Number}
function extractPolygonsFromContours(contouredBinaryImage)
{
    var ret = [];
    return ret;
}

function posArraysToPixiVecArrays(array)
{
    return array;
}

export function computeContourPolygons(binaryImage, center, size) {
    const width = binaryImage[0].length;
    const height = binaryImage.length;

    let testImage = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ]

    /*
        Expected
        [0, 2, 0],
        [2, -1, 2],
        [0, 2, 0],
    */

    const markedMatrix = markContous(addPadding(testImage));
    console.log(markedMatrix);
    // var polygons = extractPolygonsFromContours(testImage);
    // let contours = posArraysToPixiVecArrays(polygons);

    let tl = new PIXI.Vec(center.x - size / 2, center.y - size / 2);
    let tr = new PIXI.Vec(center.x + size / 2, center.y - size / 2);
    let br = new PIXI.Vec(center.x + size / 2, center.y + size / 2);
    let bl = new PIXI.Vec(center.x - size / 2, center.y + size / 2);

    // Returning trapeze as example.
    let hardcoded = [
        [tl.clone(),
        tl.clone().add(new PIXI.Vec(160, 0)),
        tl.clone().add(new PIXI.Vec(0, 80))],

        [tr.clone(),
        tr.clone().add(new PIXI.Vec(0, 70)),
        tr.clone().add(new PIXI.Vec(-120, 80)),
        tr.clone().add(new PIXI.Vec(-170, 0)),],

        [br.clone(),
        br.clone().add(new PIXI.Vec(-20, 0)),
        br.clone().add(new PIXI.Vec(-100, -240)),
        br.clone().add(new PIXI.Vec(0, -300)),],

        [bl.clone(),
        bl.clone().add(new PIXI.Vec(0, -200)),
        bl.clone().add(new PIXI.Vec(50, -200)),
        bl.clone().add(new PIXI.Vec(70, 0)),],
    ]

    return hardcoded;
}