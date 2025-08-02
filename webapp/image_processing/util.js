/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

// Slides a 3x3 kernel over the image.
// If there are both zeroes and ones in the kernel, set all pixels in the kernel to one.
export function closeSmallEmptyGaps(binaryImage) {
    const height = binaryImage.length;
    const width = binaryImage[0].length;
    // Copy the image to avoid modifying in place during scan
    const result = binaryImage.map(row => row.slice());
    for (let y = 0; y < height - 2; y++) {
        for (let x = 0; x < width - 2; x++) {
            let hasZero = false;
            let hasOne = false;
            // Scan 3x3 kernel
            for (let dy = 0; dy < 3; dy++) {
                for (let dx = 0; dx < 3; dx++) {
                    const val = binaryImage[y + dy][x + dx];
                    if (val === 0) hasZero = true;
                    if (val === 1) hasOne = true;
                }
            }
            if (hasZero && hasOne) {
                // Set all to one in result
                for (let dy = 0; dy < 3; dy++) {
                    for (let dx = 0; dx < 3; dx++) {
                        result[y + dy][x + dx] = 1;
                    }
                }
            }
        }
    }
    return result;
}

// Given a binary image, delete each isolated group of pixels whose area is
// less than `island_percentage_threshold` of the total image area.
// Writes the result back to the binary binaryImage.
export function closeSmallIslands(binaryImage, island_percentage_threshold, island_pixel_value) {
    if (island_pixel_value !== 0 && island_pixel_value !== 1) {
        throw new Error("island_pixel_value must be either 0 or 1");
    }
    const width = binaryImage[0].length;
    const height = binaryImage.length;
    const visited = new Uint8Array(width * height);
    const threshold = (width * height) * island_percentage_threshold;
    const islands = [];
    const targetValue = island_pixel_value;
    const fillValue = targetValue === 1 ? 0 : 1;

    // Function to perform flood fill and collect island pixels
    function floodFill(x, y) {
        const stack = [[x, y]];
        const island = [];
        let idx;

        while (stack.length) {
            const [cx, cy] = stack.pop();
            idx = cy * width + cx;

            if (cx < 0 || cy < 0 || cx >= width || cy >= height || visited[idx] || binaryImage[cy][cx] !== targetValue) {
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
            if (binaryImage[y][x] === targetValue && !visited[y * width + x]) {
                const island = floodFill(x, y);
                islands.push(island);
            }
        }
    }

    // Remove small islands
    let removedCount = 0;
    let keptCount = 0;
    for (const island of islands) {
        if (island.length < threshold) {
            for (const [x, y] of island) {
                binaryImage[y][x] = fillValue;
            }
            removedCount++;
        } else {
            keptCount++;
        }
    }

    return binaryImage;
}
