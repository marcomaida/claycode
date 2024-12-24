import { centroid, findClosestPointIndex, getCircleIntersections, isPointInPolygon, perimeter, scalePolygon, translatePolygon } from "./geometry.js";

export function createMouseHeadPolygon(center, scale) {
    const EARS_RADIUS = 0.65;
    const EARS_OFFSET = 1.05;
    const NUM_SEGMENTS = 100;
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

    console.log(polygon)
    return polygon
}

export function createStarPolygon(inputPolygon, numPoints, rotation = (Math.random() * 2 * Math.PI)) {
    const center = centroid(inputPolygon); // Find the center of the input polygon
    let outerRadius = perimeter(inputPolygon) / (2 * numPoints); // Initial guess for outer radius 
    let innerRadius = outerRadius * 0.5; // Inner radius is half of the outer radius
    const step = (2 * Math.PI) / (numPoints * 2); // Angle step for star points
    let star;

    const MAX_TRIES = 20;
    for (let i = 0; i < MAX_TRIES; i++) {
        star = [];
        for (let i = 0; i < numPoints * 2; i++) {
            const angle = i * step + rotation; // Apply random rotation
            const radius = i % 2 === 0 ? outerRadius : innerRadius; // Alternate between outer and inner radius
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            star.push(new PIXI.Vec(x, y));
        }

        // Check if the star is fully contained in the input polygon
        if (star.every((point) => isPointInPolygon(inputPolygon, point))) {
            return star;
        }

        outerRadius *= 0.95; // Reduce the outer radius slightly and try again
        innerRadius = outerRadius * 0.5; // Inner radius is half of the outer radius

        if (i == MAX_TRIES - 1) {
            //console.log("Failed to pack star");
        }
    }

    return star

}