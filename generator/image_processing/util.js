// Given a binary image, delete each isolated group of pixels whose area is
// less than `island_percentage_threshold` of the total image area.
// Writes the result back to the binary binaryImage.
export function closeSmallIslands(binaryImage, island_percentage_threshold) {
    const width = binaryImage[0].length;
    const height = binaryImage.length;
    const visited = new Uint8Array(width * height);
    const threshold = (width * height) * island_percentage_threshold;
    const islands = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (binaryImage[y][x] === 1 && !visited[getPixelIndex({ width: width, height: height }, x, y)]) {
                let queue = [[x, y]];
                let island = [];

                while (queue.length > 0) {
                    let [qx, qy] = queue.pop();
                    if (qx < 0 || qx >= width || qy < 0 || qy >= height) continue;
                    if (binaryImage[qy][qx] === 0 || visited[getPixelIndex({ width: width, height: height }, qx, qy)]) continue;

                    visited[getPixelIndex({ width: width, height: height }, qx, qy)] = 1;
                    island.push([qx, qy]);

                    queue.push([qx - 1, qy]);
                    queue.push([qx + 1, qy]);
                    queue.push([qx, qy - 1]);
                    queue.push([qx, qy + 1]);
                }

                if (island.length < threshold) {
                    islands.push(island);
                }
            }
        }
    }

    for (let island of islands) {
        for (let [ix, iy] of island) {
            binaryImage[iy][ix] = 0; // Make the pixel value 0 (remove the island)
        }
    }
}

