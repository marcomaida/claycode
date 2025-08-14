/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { drawPolygon } from "../packer/draw.js";

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
    for (const island of islands) {
        if (island.length < threshold) {
            for (const [x, y] of island) {
                binaryImage[y][x] = fillValue;
            }
        }
    }

    return binaryImage;
}

// Utility: add first point to end if not already closed
export function closePolygon(poly) {
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
export function openPolygon(poly) {
    if (poly.length > 1) {
        const first = poly[0];
        const last = poly[poly.length - 1];
        if (first.x === last.x && first.y === last.y) {
            poly.pop();
        }
    }
    return poly;
}

// Draws polygons with bright colors, or a single override color if provided
export function drawPolygonsWithColors(polygons, overrideColor = null) {
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
        0x80ff00, // Chartreuse
        0x0080ff, // Azure
        0x80ffff, // Light Cyan
        0xffff80, // Light Yellow
        0xff80ff, // Light Magenta
        0x80ff80, // Light Green
        0x8080ff, // Light Blue
    ];
    polygons.forEach((polygon, i) => {
        const color = overrideColor !== null ? overrideColor : brightColors[i % brightColors.length];
        drawPolygon(polygon, color);
    });
}
