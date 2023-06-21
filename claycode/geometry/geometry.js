// Make a rectangle mesh (array of 12 elements)
export function rectangleMesh(from, to, thickness) {
    const a = to.clone()
            .sub(from)
            .normalize()
            .multiplyScalar(thickness/2)
            .perpendicular(false)

    const b = a.clone().multiplyScalar(-1)
    const c = b.clone()
    const d = a.clone()

    a.add(from)
    b.add(from)
    c.add(to)
    d.add(to)

    return [a.x, a.y, b.x, b.y, c.x, c.y,
            a.x, a.y, c.x, c.y, d.x, d.y]
}

export function circlePolygon(center, radius, numSegments) {
    const circle = Array(numSegments).fill(new PIXI.Vector(0,0))

    for (var i = 0; i < numSegments; i ++) {
        const angle = i / numSegments * 2 * Math.PI
        circle[i] = new PIXI.Vector(Math.cos(angle)*radius,
                                    Math.sin(angle)*radius)
        circle[i].add(center)
    }

    return circle
}

/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
export function doPolygonsIntersect (a, b) {
    var polygons = [a, b];
    var minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {
        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        var polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            var i2 = (i1 + 1) % polygon.length;
            var p1 = polygon[i1];
            var p2 = polygon[i2];

            // find the line perpendicular to this edge
            var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.y * a[j].y;
                if (minA === undefined || projected < minA) {
                    minA = projected;
                }
                if (maxA === undefined || projected > maxA) {
                    maxA = projected;
                }
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.y * b[j].y;
                if (minB === undefined|| projected < minB) {
                    minB = projected;
                }
                if (maxB === undefined || projected > maxB) {
                    maxB = projected;
                }
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
    }
    return true;
};

export function centroid(polygon) {
    const centroid = new PIXI.Vector(0,0)

    for (const point of polygon)
        centroid.add(point)

    centroid.multiplyScalar(1/polygon.length)
    
    return centroid
}

export function scalePolygon(polygon, scale) {
    const centr = centroid(polygon)

    for (const point of polygon)
        point.sub(centr).multiplyScalar(scale).add(centr)
}

//TODO probably not working for any angle, but only for 90 degrees
//Clearly fixable with some effort
export function coatPolygon(polygon, coating) {
    for (const [i, point] of polygon.entries()) {
        const prev = i != 0 ? polygon[i-1] : polygon[polygon.length - 1]
        const next = i < polygon.length - 1 ? polygon[i+1] : polygon[0]

        const lprev = point.clone().sub(prev).normalize()
        const lnext = point.clone().sub(next).normalize()

        lprev.add(lnext).normalize().multiplyScalar(coating)
        point.add(lprev)
    }
}