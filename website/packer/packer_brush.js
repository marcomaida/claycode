/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { drawPolygon } from "./draw.js";
import { area, circularity, matchPolygonsCentroids } from "../geometry/geometry.js";
import { createStarPolygon, createMouseHeadPolygon, createCirclePolygon, createUPolygon } from "../geometry/shapes.js";

export class PackerBrush {
    // Enum for polygon shapes
    static Shape = Object.freeze({
        UNSPECIFIED: 'unspecified',
        SQUARE: 'square',
        CIRCLE: 'circle',
        MOUSE: 'mouse',
        STAR: 'star',
        U: 'u',
    });

    constructor(colors, leafColors, leafShapes) {
        if (!Array.isArray(colors) || !colors.every(c => typeof c === 'number' && c >= 0x000000 && c <= 0xffffff)) {
            throw new Error('Colors must be an array of valid hex color values.');
        }
        if (!Array.isArray(leafColors) || !leafColors.every(c => typeof c === 'number' && c >= 0x000000 && c <= 0xffffff)
            || colors.length != leafColors.length) {
            throw new Error('Colors must be an array of valid hex color values, and match `colors` size.');
        }
        if (!Array.isArray(leafShapes) || !leafColors.every(el => !Object.values(PackerBrush.Shape).includes(el))
            || colors.length != leafShapes.length) {
            throw new Error('Leaf shapes must be an array of valid shapes, and match `colors` size.');
        }

        this.colors = colors;
        this.leafColors = leafColors;
        this.leafShapes = leafShapes;
        this.color_index = 0;
    }

    drawNode(node) {
        // Handle custom leaf
        if (node.isLeaf()) {
            this.drawLeaf(node);
        }
        else {
            let color = this.colors[(node.depth + 1) % 2]
            drawPolygon(node.getPolygon(), color);
        }
    }

    drawRoot(polygon) {
        drawPolygon(polygon, this.colors[0]);
    }

    drawLeaf(node) {
        let color = this.leafColors[(node.depth + 1) % 2]
        let shape = this.leafShapes[(node.depth) % 2]
        let originalPolygon = node.getPolygon();
        let circ = circularity(originalPolygon); // Heuristic to decide dimension of custom polygon
        let customPolygon = null;
        let baseRadius = Math.sqrt(area(originalPolygon) / Math.PI);
        switch (shape) {
            case PackerBrush.Shape.UNSPECIFIED:
                customPolygon = originalPolygon;
                break;
            case PackerBrush.Shape.SQUARE:
                customPolygon = createCirclePolygon(new PIXI.Vec(0, 0), circ * baseRadius, 4, new PIXI.Vec(1, 1), 45)
                break;
            case PackerBrush.Shape.CIRCLE:
                customPolygon = createCirclePolygon(new PIXI.Vec(0, 0), circ * baseRadius, 10)
                break;
            case PackerBrush.Shape.MOUSE:
                customPolygon = createMouseHeadPolygon(new PIXI.Vec(0, 0), circ / 2 * baseRadius)
                break;
            case PackerBrush.Shape.STAR:
                customPolygon = createStarPolygon(new PIXI.Vec(0, 0), circ * baseRadius, 5);
                break;
            case PackerBrush.Shape.U:
                const u = 0.8 * baseRadius;
                const thickness = u / 3;
                customPolygon = createUPolygon(new PIXI.Vec(0, 0), u, u * 1.8 * circ, thickness, thickness);
                break;
            default:
                throw "Unsupported leaf shape requested";
        }

        matchPolygonsCentroids(originalPolygon, customPolygon);
        drawPolygon(customPolygon, color);
    }
}


export class DefaultBrush extends PackerBrush {
    constructor() {
        const colors = [0xFFFFFF, 0x000000];
        const shapes = [PackerBrush.Shape.UNSPECIFIED, PackerBrush.Shape.UNSPECIFIED];
        super(colors, colors, shapes);
    }
}
