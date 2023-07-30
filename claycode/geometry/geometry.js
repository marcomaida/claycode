import {} from "./polygon_offset.js";
import {} from "../geometry/vector.js";

// Smallest unit, used to avoid floating point precision issues
export const EPS = 0.0000001;

export function circlePolygon(center, radius, numSegments) {
  const circle = Array(numSegments).fill(new PIXI.Vec(0, 0));

  for (var i = 0; i < numSegments; i++) {
    const angle = (i / numSegments) * 2 * Math.PI;
    circle[i] = new PIXI.Vec(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
    circle[i].add(center);
  }

  return circle;
}

/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
export function doPolygonsIntersect(a, b) {
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
        if (minB === undefined || projected < minB) {
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
}

export function centroid(polygon) {
  const centroid = new PIXI.Vec(0, 0);

  for (const vertex of polygon) centroid.add(vertex);

  centroid.multiplyScalar(1 / polygon.length);

  return centroid;
}

export function perimeter(polygon) {
  let perimeter = 0;

  for (const [i, vertex] of polygon.entries()) {
    perimeter += vertex.distanceTo(polygon[(i + 1) % polygon.length]);
  }

  return perimeter;
}

export function area(polygon) {
  let sum = 0;
  // Shoelace formula
  for (const [i, vertex] of polygon.entries()) {
    const next_vertex = polygon[(i + 1) % polygon.length];
    sum += vertex.x * next_vertex.y - next_vertex.x * vertex.y;
  }

  return Math.abs(sum) * 0.5;
}

// Computes the circularity of the polygon
// It is 1 for a perfect circle
// It is 0 for an infinitely squashed and long polygon
// (Iso-Perimetric Quotient / Polsby-Popper method / Cox’s circularity)
// (https://mathworld.wolfram.com/IsoperimetricQuotient.html)
export function circularity(polygon) {
  return (4 * Math.PI * area(polygon)) / Math.pow(perimeter(polygon), 2);
}

/* Given a parameter `0 <= t < 1`, gets the point on the perimeter of
   the polygon, where 0 is the first vertex and 1 is the last one. 
   Returns the point and the index of the previous vertex (which is useful
   to cut the polygon). */
export function pickPointOnPerimeter(polygon, t) {
  // console.assert(0 <= t && t < 1)
  const total_travel = t * perimeter(polygon);
  // The solution will be a lerp between two vertices.
  // Find those vertices first
  let start_vertex_idx = 0;
  let traveled = 0;
  for (const [i, point] of polygon.entries()) {
    const travel_dist = point.distanceTo(polygon[(i + 1) % polygon.length]);
    if (traveled + travel_dist <= total_travel) {
      start_vertex_idx = i + 1;
      traveled += travel_dist;
    } else {
      // We found the first vertex
      break;
    }
  }

  // Lerp between the two vertices w.r.t. the remaining
  // distance to travel
  const left_to_travel = total_travel - traveled;
  const va = polygon[start_vertex_idx];
  const vb = polygon[(start_vertex_idx + 1) % polygon.length];
  const tab = left_to_travel / va.distanceTo(vb);
  // console.assert(0 <= tab && tab < 1)

  return [start_vertex_idx, va.clone().lerp(vb, tab)];
}

export function scalePolygon(polygon, scale) {
  const centr = centroid(polygon);

  for (const point of polygon)
    point.sub(centr).multiplyScalar(scale).add(centr);
}

// Returns a smaller polygon which is padded a certain amount
export function padPolygon(polygon, amount) {
  /* Must do some weird stuff to make the format match with what
       the library expects. My library does not want the first and last
       poing to be equal, and works with a vector structure instead of
       with nested arrays. */
  let polygon_vec = polygon.map((p) => [p.x, p.y]);
  polygon_vec.push(polygon_vec[0].slice(0)); // copy first element
  var offset = new Offset();
  const data = offset.data(polygon_vec);
  var padded_pols = data.padding(amount);
  if (padded_pols.length == 0) {
    throw "Error padding polygon -- No space left";
  }
  let padded = padded_pols[0];
  padded.pop(); // Remove last element
  let polygon_padded = padded.map((p) => new PIXI.Vec(p[0], p[1]));
  return polygon_padded;
}

// Finds the intersection between segments ab and cd
export function segmentSegmentIntersection(a, b, c, d) {
  // Check if none of the lines are of length 0
  if ((a.x === b.x && a.y === b.y) || (c.x === d.x && c.y === d.y)) {
    return null;
  }

  let denominator = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);

  // Lines are parallel or coincident (overlapping)
  if (denominator === 0) {
    // Check if the segments are overlapping
    if (
      Math.max(a.x, b.x) < Math.min(c.x, d.x) ||
      Math.max(c.x, d.x) < Math.min(a.x, b.x) ||
      Math.max(a.y, b.y) < Math.min(c.y, d.y) ||
      Math.max(c.y, d.y) < Math.min(a.y, b.y)
    ) {
      return null;
    } else {
      // Segments are overlapping, return a point
      return new PIXI.Vec(Math.max(a.x, c.x), Math.max(a.y, c.y));
    }
  }

  let ua =
    ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
  let ub =
    ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = a.x + ua * (b.x - a.x);
  let y = a.y + ua * (b.y - a.y);

  return new PIXI.Vec(x, y);
}

/* Returns all intersections between the polygon and the segment ab
   (one intersection per edge max) 
   If `exclude_ab` is true, does not consider a and b as intersections.
   */
export function segmentPolygonIntersections(polygon, a, b, exclude_ab) {
  let intersections = [];
  for (const [i, vertex] of polygon.entries()) {
    const next_vertex = polygon[(i + 1) % polygon.length];

    let itx = segmentSegmentIntersection(vertex, next_vertex, a, b);
    if (itx) {
      const is_a_or_b = itx.nearly_equals(a) || itx.nearly_equals(b);
      if (!exclude_ab || !is_a_or_b) {
        let already_added = false;
        for (const added_itx of intersections) {
          if (added_itx.nearly_equals(itx)) {
            already_added = true;
            break;
          }
        }
        if (!already_added) {
          intersections.push(itx);
        }
      }
    }
  }

  return intersections;
}

export function isPointInPolygon(polygon, point) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i].x,
      yi = polygon[i].y;
    var xj = polygon[j].x,
      yj = polygon[j].y;

    var intersect =
      yi > point.y != yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
