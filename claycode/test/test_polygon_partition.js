import { area, circlePolygon } from "../geometry/geometry.js";

import { cutPolygon } from "../geometry/polygon_partition.js";
import {
  assert_eq,
  assert_true,
  assert_nearly_eq,
  test_section,
  test_heading,
} from "./test_utils.js";

try {
  test_heading("Polygon Partition");
  const square = [
    new PIXI.Vec(1, 1),
    new PIXI.Vec(1, 7),
    new PIXI.Vec(7, 7),
    new PIXI.Vec(7, 1),
  ];
  const circle_r3_e100000 = circlePolygon(new PIXI.Vec(4, 4), 3, 100000);

  const [l_cut_sq, r_cut_sq] = cutPolygon(square, 0, square[0], 2, square[2]);
  assert_eq(area(l_cut_sq), area(r_cut_sq));
  assert_eq(area(l_cut_sq) + area(r_cut_sq), area(square));

  const [l_cut_circle, r_cut_circle] = cutPolygon(
    circle_r3_e100000,
    0,
    circle_r3_e100000[0],
    2,
    circle_r3_e100000[circle_r3_e100000.length / 2]
  );

  assert_nearly_eq(
    area(l_cut_circle) + area(r_cut_circle),
    area(circle_r3_e100000),
    0.0006 // Loss of precision here
  );
} catch (error) {
  console.error(`TEST FAILED: ${error}`);
}
