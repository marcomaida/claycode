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

export function createMouseHeadPolygon(center, scale) {
    const EARS_RADIUS = 0.65;
    const EARS_OFFSET = 1.05;
    const NUM_SEGMENTS = 50;
    const theta = Array.from({ length: NUM_SEGMENTS }, (_, i) => (i * 2 * Math.PI) / NUM_SEGMENTS);

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
