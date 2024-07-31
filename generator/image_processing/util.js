// Given a binary image, delete each isolated group of pixels whose area is
// less than `island_percentage_threshold` of the total image area.
// Writes the result back to the binary binaryImage.
export function closeSmallIslands(binaryImage, island_percentage_threshold) {
    const width = binaryImage[0].length;
    const height = binaryImage.length;
    const visited = new Uint8Array(width * height);
    const threshold = (width * height) * island_percentage_threshold;
    const islands = [];

    // Function to perform flood fill and collect island pixels
    function floodFill(x, y) {
        const stack = [[x, y]];
        const island = [];
        let idx;

        while (stack.length) {
            const [cx, cy] = stack.pop();
            idx = cy * width + cx;

            if (cx < 0 || cy < 0 || cx >= width || cy >= height || visited[idx] || binaryImage[cy][cx] === 0) {
                continue;
            }

            visited[idx] = 1;
            island.push([cx, cy]);

            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }

        return island;
    }

    // Find all islands
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (binaryImage[y][x] === 1 && !visited[y * width + x]) {
                const island = floodFill(x, y);
                islands.push(island);
            }
        }
    }

    // Remove small islands
    for (const island of islands) {
        if (island.length < threshold) {
            for (const [x, y] of island) {
                binaryImage[y][x] = 0;
            }
        }
    }

    return binaryImage;
}
