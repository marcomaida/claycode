import { drawPolygon } from "./draw.js";

export class PackerBrush {
    // Enum for polygon shapes
    static Shape = Object.freeze({
        UNSPECIFIED: 'unspecified',
        SQUARE: 'square',
        CIRCLE: 'circle',
        MICKEY: 'mickey',
    });

    constructor(codeShape, leafShape, colors, nodePadding, minNodeArea) {
        if (!Object.values(PackerBrush.Shape).includes(codeShape)) {
            throw new Error('Invalid polygon shape.');
        }
        if (!Object.values(PackerBrush.Shape).includes(leafShape)) {
            throw new Error('Invalid leaf shape.');
        }
        if (!Array.isArray(colors) || !colors.every(hexColor => typeof hexColor === 'number' && hexColor >= 0x000000 && hexColor <= 0xffffff)) {
            throw new Error('Colors must be an array of valid hex color values.');
        }

        this.codeShape = codeShape;
        this.leafShape = leafShape;
        this.nodePadding = nodePadding;
        this.minNodeArea = minNodeArea;
        this.colors = colors;
        this.color_index = 0;

        // this.colors = [
        // 0x003399, // Darker Blue (adjusted tone)
        // 0x0057B7, // Original Blue (official EU flag color)

        // 0x113CCF, // Persian Blue
        // 0xFCD018, // Blast Off Yellow

        // 0x3CAEA3, // Teal
        // 0xF6D55C, // Yellow
        // 0xED553B  // Coral Red

        // 0x4B0082, // Indigo
        // 0x800080, // Purple
        // 0x8A2BE2, // Blue Violet
        // 0x9932CC, // Dark Orchid
        // 0xBA55D3, // Medium Orchid
        // 0xDA70D6, // Orchid
        // 0xD8BFD8, // Thistle
        // 0xE6E6FA, // Lavender
        // 0xFF00FF, // Magenta
        // 0x9400D3  // Dark Violet
        // ];
    }

    getCodeShape() {
        return this.codeShape;
    }

    getNodePadding() {
        return this.nodePadding;
    }

    getMinNodeArea() {
        return this.minNodeArea;
    }

    drawNode(polygon, node) {
        // Draw element
        let color_idx = (node.depth + 1) % 2
        drawPolygon(polygon, this.colors[color_idx]);
    }

    drawRoot(polygon) {
        // Draw element
        drawPolygon(polygon, this.colors[0]);
    }
}

export class DefaultBrush extends PackerBrush {
    constructor(shape, nodePadding, minNodeArea) {
        super(shape, PackerBrush.Shape.UNSPECIFIED, [0xFFFFFF, 0x000000], nodePadding, minNodeArea);
    }
}
