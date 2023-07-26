import {
  area,
  pickPointOnPerimeter,
  segmentPolygonIntersections,
  isPointInPolygon,
  circularity,
} from "./geometry.js";

/* Given a polygon, return a list of polygons with the areas 
   approximating the ones specified in amounts */
export function partitionPolygon(polygon, amounts) {
  let original_amounts_num = amounts.length;
  // console.assert(amounts.reduce((a, b) => a + b, 0) <= 1.)

  let partition = [];
  let to_split = polygon;
  while (amounts.length > 0) {
    const a = amounts.shift();

    if (amounts.length == 0) {
      partition.push(to_split);
    } else {
      const res = splitPolygonInSimplestPartition(to_split, a);
      if (res == null) {
        throw "Unable to split the polygon!";
      }
      const [pa, pb] = res;
      partition.push(pa);
      to_split = pb;
      amounts = Math.normalise(amounts); // normalise remaining area to have total of 1
    }
  }

  if (partition.length !== original_amounts_num) {
    throw `Error partitioning polygon, unexpected size: ${partition.length}, expected ${original_amounts_num}`;
  }
  return partition;
}

/* Given a polygon `x`, returns a partition of two polygons `a` 
   and `b`, where `a` has the specified area and `b` has the rest.
   The solution is approximate.

   The algorithm tries to get the simplest partitions possible, that is, 
   minimise the "complexity" of the polygon (i.e., minimise the perimeter w.r.t. area).
   (https://www.microimages.com/documentation/TechGuides/81PolyShape.pdf). */
export function splitPolygonInSimplestPartition(
  polygon,
  partition_target_area_perc
) {
  const CIRCULARITY_AREA_WEIGHT = 0.9; // 0 = only circularity, 1 = only area
  const MAX_TRIES = 1;
  // console.assert(0. < partition_target_area_perc && partition_target_area_perc < 1.)

  const total_area = area(polygon);
  const target_area_a = partition_target_area_perc * total_area;

  let min_error = null;
  let partition = null;
  for (let i = 0; i < MAX_TRIES; i++) {
    const [cut_va_idx, va] = pickPointOnPerimeter(polygon, Math.random());
    const [cut_vb_idx, vb] = pickPointOnPerimeter(polygon, Math.random());

    let res = cutPolygon(polygon, cut_va_idx, va, cut_vb_idx, vb);

    if (res == null) {
      continue;
    } // bad cut

    let [pa, pb] = res;
    for (let r = 0; r < 2; r++) {
      // repeat twice to check also opposite combination
      const error_area =
        Math.abs(area(pa) - target_area_a) /
        Math.max(target_area_a, 1 - target_area_a);
      const error_circ = 1 - (circularity(pa) + circularity(pb)) / 2;
      const error = Math.lerp(error_circ, error_area, CIRCULARITY_AREA_WEIGHT);
      if (error < min_error || min_error === null) {
        min_error = error;
        partition = [pa, pb];
      }

      // Swap `pa` and `pb`
      const pt = pa;
      pa = pb;
      pb = pt;
    }
  }

  return partition;
}

/* 
    Given a polygon, two cut vertices, and two new vertices, 
    cuts the polygon at the given cut points and returns the
    two resulting polygon

    In this example, the polygon ABCD is cut at VA and VB.
    The cut vertex of VA is A, while for VB it is B
   
    B-VB----C      B-VB    VB----C
    |       |      | /     /     | 
    VA      |  =>  VA    VA      |   
    |       |            |       |
    A-------D            A-------D
    
    This function can fail in two conditions
    - The cut vertices are equal
    - The polygon is convex and the two vertices do not cut the polygon
        _____
       / ___ \
      / /   \ \
     / VA----VB\    In this example, VA-VB does not cut the polygon
    /_/       \_\
*/
export function cutPolygon(polygon, cut_va_idx, va, cut_vb_idx, vb) {
  if (cut_va_idx == cut_vb_idx) return null;

  /* First, we understand whether the points properly partition the 
       polygon in two. We assume that `va` and `vb` lie on the perimeter. 
       Therefore, the segment `va-vb` can only form three scenarios:
       1. The segment is completely contained in the polygon - GOOD, valid cut
       2. The segment is completely outside the polygon because of concavity - BAD cut
       3. The segment is partially inside, partially outside the polygon - BAD cut */

  // Get all intersections with polygon edges, excluding `va` and `vb` themselves
  const intersections = segmentPolygonIntersections(polygon, va, vb, true);
  if (intersections.length > 0) {
    return null; // Scenario 3, the cut intersects the polygon. Bad cut.
  }

  // At this point, the segment is either fully inside or fully outside the polygon.
  // (excluding `va` and `vb`). We check the middle point to understand which case it is.
  if (!isPointInPolygon(polygon, va.clone().lerp(vb, 0.5))) {
    return null; // Scenario 2, the cut is outside the polygon. Bad cut.
  }

  /* At this point, we know the cut is good and we can proceed. 
       First, reduce to the case in which `va_l < vb_l`. */
  if (cut_vb_idx < cut_va_idx) {
    let t = [cut_va_idx, va];
    va = vb;
    cut_va_idx = cut_vb_idx;
    vb = t[1];
    cut_vb_idx = t[0];
  }

  /* Perform the cut.
       - The polygon is represented as an array of vertices. 
       - `va_l` and `vb_l` are the two vertices at the left of the cut points.

       e.g., indicating vertices with numbers:
       [0 1 2 va_l 4 5 vb_l 7 8]
       We want:
       [vb 7 8 0 1 2 va_l va] [va 4 5 vb_l vb]

       Edge case: `vb_l` is the last element of the array, making `vb_r` = 0
     */

  // Note, these are indices
  const va_l = cut_va_idx;
  const vb_l = cut_vb_idx;

  const pa = polygon
    .slice(vb_l + 1) // Append ( vb_l.. ] -- in case of overflow, slice is empty
    .concat(polygon.slice(0, va_l + 1)); // Append [ ..va_l ]
  if (!pa[pa.length - 1].nearly_equals(va)) {
    pa.push(va.clone());
  }
  if (!pa[0].nearly_equals(vb)) {
    pa.push(vb.clone());
  }

  const pb = polygon.slice(va_l + 1, vb_l + 1); // Append ( va_l..vb_l ]
  if (!pb[pb.length - 1].nearly_equals(vb)) {
    pb.push(vb.clone());
  }
  if (!pb[0].nearly_equals(va)) {
    pb.push(va.clone());
  }

  return [pa, pb];
}
