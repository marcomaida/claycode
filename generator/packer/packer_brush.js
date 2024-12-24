import { drawPolygon } from "./draw.js";
import { area, matchPolygonsCentroids } from "../geometry/geometry.js";
import { createStarPolygon, createMouseHeadPolygon, createCirclePolygon } from "../geometry/shapes.js";

export class PackerBrush {
    // Enum for polygon shapes
    static Shape = Object.freeze({
        UNSPECIFIED: 'unspecified',
        SQUARE: 'square',
        CIRCLE: 'circle',
        MOUSE: 'mouse',
        STAR: 'star',
    });

    constructor(leafShape, colors, leafColors) {
        if (!Object.values(PackerBrush.Shape).includes(leafShape)) {
            throw new Error('Invalid leaf shape.');
        }
        if (!Array.isArray(colors) || !colors.every(c => typeof c === 'number' && c >= 0x000000 && c <= 0xffffff)) {
            throw new Error('Colors must be an array of valid hex color values.');
        }
        if (!Array.isArray(leafColors) || !leafColors.every(c => typeof c === 'number' && c >= 0x000000 && c <= 0xffffff)
            || colors.length != leafColors.length) {
            throw new Error('Colors must be an array of valid hex color values, and match `colors` size.');
        }

        this.leafShape = leafShape;
        this.colors = colors;
        this.leafColors = leafColors;
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
        let originalPolygon = node.getPolygon();
        let customPolygon = null;
        let baseRadius = Math.sqrt(area(originalPolygon) / Math.PI);
        switch (this.leafShape) {
            case PackerBrush.Shape.CIRCLE:
                drawPolygon(node.getPolygon(), color);
                break;
            case PackerBrush.Shape.CIRCLE:
                customPolygon = createCirclePolygon(new PIXI.Vec(0, 0), 0.8 * baseRadius, 10)
                break;
            case PackerBrush.Shape.MOUSE:
                customPolygon = createMouseHeadPolygon(new PIXI.Vec(0, 0), 0.5 * baseRadius)
                break;
            case PackerBrush.Shape.STAR:
                customPolygon = createStarPolygon(new PIXI.Vec(0, 0), 0.7 * baseRadius, 5);
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
        super(PackerBrush.Shape.UNSPECIFIED, colors, colors);
    }
}
