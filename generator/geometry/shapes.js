/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

import { centroid, findClosestPointIndex, getCircleIntersections, isPointInPolygon, perimeter, scalePolygon, translatePolygon } from "./geometry.js";

export function createCirclePolygon(
    center,
    radius,
    numSegments,
    scale_vec = new PIXI.Vec(1, 1),
    rotation_deg = 0
) {
    const circle = Array(numSegments).fill(new PIXI.Vec(0, 0));
    const rotation_rad = (rotation_deg / 180) * Math.PI;
    for (var i = 0; i < numSegments; i++) {
        const angle = (i / numSegments) * 2 * Math.PI + rotation_rad;
        circle[i] = new PIXI.Vec(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
        circle[i].add(center);
    }

    scalePolygon(circle, scale_vec);

    return circle;
}

export function createMouseHeadPolygon(center, scale, num_segments = 50) {
    const EARS_RADIUS = 0.65;
    const EARS_OFFSET = 1.05;
    const theta = Array.from({ length: num_segments }, (_, i) => (i * 2 * Math.PI) / num_segments);

    // Define basic circles
    const headCircle = theta.map(t => [Math.cos(t), Math.sin(t)]);
    const earLCircle = theta.map(t => [
        EARS_RADIUS * Math.cos(t) - EARS_OFFSET,
        EARS_RADIUS * Math.sin(t) + EARS_OFFSET
    ]);
    const earRCircle = theta.map(t => [
        EARS_RADIUS * Math.cos(t) + EARS_OFFSET,
        EARS_RADIUS * Math.sin(t) + EARS_OFFSET
    ]);

    // Filter circles.
    // Read variables: "rbx" = [r]ight ear, [b]ottom point, [x] coordinate
    const [[ltx, lty], [lbx, lby]] = getCircleIntersections(0, 0, 1, -EARS_OFFSET, EARS_OFFSET, EARS_RADIUS);
    const [[rbx, rby], [rtx, rty]] = getCircleIntersections(0, 0, 1, EARS_OFFSET, EARS_OFFSET, EARS_RADIUS);

    let headLow = headCircle.filter(([x, y]) => y < rby);
    let earL = earLCircle.filter(([x, y]) => x <= lbx || y >= lty);
    let earR = earRCircle.filter(([x, y]) => x >= rbx || y >= rty);
    let headHigh = headCircle.filter(([x, y]) => y > rty);

    // Reorder points to create a consistent polygon where adjacent points come one
    // after the other in the array.
    // NOTE: Points were generated anti-clockwise.
    const headLowStartIdx = findClosestPointIndex(headLow, [lbx, lby])
    headLow = headLow.slice(headLowStartIdx).concat(headLow.slice(0, headLowStartIdx));

    const earRIdx = findClosestPointIndex(earR, [rbx, rby])
    earR = earR.slice(earRIdx).concat(earR.slice(0, earRIdx));

    const headHighStartIdx = findClosestPointIndex(headHigh, [rtx, rty])
    headHigh = headHigh.slice(headHighStartIdx).concat(headHigh.slice(0, headHighStartIdx));

    const earLIdx = findClosestPointIndex(earL, [ltx, lty])
    earL = earL.slice(earLIdx).concat(earL.slice(0, earLIdx));

    // Concat, generate polygon, translate, scale, return
    const points = [...headLow, ...earR, ...headHigh, ...earL];
    let polygon = points.map((p) => new PIXI.Vec(p[0], p[1]));
    translatePolygon(polygon, center)
    scalePolygon(polygon, new PIXI.Vec(scale, -scale))

    return polygon
}

export function createStarPolygon(center, outerRadius, numPoints, rotation = (Math.random() * 2 * Math.PI)) {
    const innerRadius = outerRadius * 0.5; // Inner radius is half of the outer radius
    const step = (2 * Math.PI) / (numPoints * 2); // Angle step for star points
    const star = [];

    for (let i = 0; i < numPoints * 2; i++) {
        const angle = i * step + rotation; // Apply rotation
        const radius = i % 2 === 0 ? outerRadius : innerRadius; // Alternate between outer and inner radius
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        star.push(new PIXI.Vec(x, y));
    }

    return star;
}

export function createHeartPolygon(center, scale, num_segments = 100, lobeSharpness = 1.25) {
    const theta = Array.from({ length: num_segments }, (_, i) => (i * 2 * Math.PI) / num_segments);

    // The lobeSharpness scales the higher frequency cosine terms.
    const heart = theta.map(t => {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y =
            12 * Math.cos(t) -
            4 * lobeSharpness * Math.cos(2 * t) -
            1.5 * lobeSharpness * Math.cos(3 * t) -
            0.5 * lobeSharpness * Math.cos(4 * t);
        return new PIXI.Vec(x, y);
    });

    scalePolygon(heart, new PIXI.Vec(scale / 20, -scale / 20));
    translatePolygon(heart, center);

    return heart;
}

export function createSpiralPolygon(
    center,
    scale,
    numTurns = 3,
    numSegments = 300,
    spacing = 0.2,
    thickness = 0.1,
    taperPower = .3
) {
    const thetaMax = numTurns * 2 * Math.PI;
    const theta = Array.from({ length: numSegments }, (_, i) => (i / (numSegments - 1)) * thetaMax);

    const innerSpiral = [];
    const outerSpiral = [];

    for (let t of theta) {
        const r = spacing * t;
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);

        // Derivative for tangent
        const dr = spacing;
        const dx = dr * Math.cos(t) - r * Math.sin(t);
        const dy = dr * Math.sin(t) + r * Math.cos(t);
        const len = Math.hypot(dx, dy);
        const nx = -dy / len;
        const ny = dx / len;

        const maxR = spacing * thetaMax;
        const taper = Math.pow(r / maxR, taperPower);
        const scaledThickness = thickness * taper;

        outerSpiral.push(new PIXI.Vec(x + scaledThickness * nx, y + scaledThickness * ny));
        innerSpiral.push(new PIXI.Vec(x - scaledThickness * nx, y - scaledThickness * ny));
    }

    // remove last point of ourter spiral to avoid overlap with inner spiral
    // The extra point breaks the padding algorithm
    outerSpiral.shift();

    const fullSpiral = outerSpiral.concat(innerSpiral.reverse());
    scalePolygon(fullSpiral, new PIXI.Vec(scale, -scale));
    translatePolygon(fullSpiral, center);

    return fullSpiral;
}

export function createUPolygon(center, width, height, thickness, inner_thickness, scale_vec = new PIXI.Vec(1, 1), rotation_deg = 0) {
    // Ensure the dimensions make sense
    if (thickness >= width / 2 || thickness >= height) {
        throw new Error("Thickness must be smaller than half the width and smaller than the height.");
    }

    // Define the points of the "U" shape
    const halfWidth = width / 2;
    const points = [
        new PIXI.Vec(-halfWidth, 0),                            // Top left corner
        new PIXI.Vec(-halfWidth, -height),                      // Bottom left corner
        new PIXI.Vec(-halfWidth + thickness, -height),          // Bottom left inner
        new PIXI.Vec(-halfWidth + thickness, -inner_thickness), // Left inner top
        new PIXI.Vec(halfWidth - thickness, -inner_thickness),  // Right inner top
        new PIXI.Vec(halfWidth - thickness, -height),           // Bottom right inner
        new PIXI.Vec(halfWidth, -height),                       // Bottom right corner
        new PIXI.Vec(halfWidth, 0),                             // Top right corner
    ];

    // Rotate the "U" shape if a rotation is provided
    const rotation_rad = (rotation_deg / 180) * Math.PI;
    if (rotation_deg !== 0) {
        points.forEach(point => {
            const x = point.x * Math.cos(rotation_rad) - point.y * Math.sin(rotation_rad);
            const y = point.x * Math.sin(rotation_rad) + point.y * Math.cos(rotation_rad);
            point.set(x, y);
        });
    }

    // Translate the points to the center
    translatePolygon(points, center);

    // Scale the polygon
    scalePolygon(points, scale_vec);

    return points;
}
