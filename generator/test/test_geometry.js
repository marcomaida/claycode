import {
  area,
  EPS,
  pickPointOnPerimeter,
  getVerticesPercPositions,
  createCirclePolygon,
  segmentSegmentIntersection,
  segmentPolygonIntersections,
  isPointInPolygon,
  circularity,
  perimeter,
} from "../geometry/geometry.js";
import {
  assert_eq,
  assert_true,
  assert_nearly_eq,
  test_section,
  test_heading,
} from "./test_utils.js";

try {
  test_heading("Geometry");
  const square = [
    new PIXI.Vec(1, 1),
    new PIXI.Vec(1, 7),
    new PIXI.Vec(7, 7),
    new PIXI.Vec(7, 1),
  ];
  const square_reverse = [...square].reverse();
  const circle_r3_e100000 = createCirclePolygon(new PIXI.Vec(4, 4), 3, 100000);
  const circle_r3_e1000 = createCirclePolygon(new PIXI.Vec(4, 4), 3, 1000);

  test_section("area");
  assert_eq(area(square), 36);
  assert_eq(area(square_reverse), 36);
  assert_nearly_eq(area(circle_r3_e100000), 28.274333882308137, EPS);

  test_section("perimeter");
  assert_eq(perimeter(square), 24);
  assert_eq(perimeter(square_reverse), 24);
  assert_nearly_eq(perimeter(circle_r3_e100000), 18.84955592, EPS);

  test_section("circularity");
  const long_rectangle = [
    new PIXI.Vec(1, 1),
    new PIXI.Vec(1, 1.00000000001),
    new PIXI.Vec(999, 1.00000000001),
    new PIXI.Vec(999, 1),
  ];
  assert_true(circularity(circle_r3_e100000) > 0.99999);
  assert_true(circularity(square) > 0.78 && circularity(square) < 0.79);
  assert_true(circularity(long_rectangle) < 0.000001);

  test_section("isPointInPolygon");
  assert_true(isPointInPolygon(square, new PIXI.Vec(3, 3)));
  assert_true(isPointInPolygon(square_reverse, new PIXI.Vec(6, 6)));
  assert_true(!isPointInPolygon(square, new PIXI.Vec(10, 5)));
  assert_true(!isPointInPolygon(square_reverse, new PIXI.Vec(-1, 0)));

  test_section("pickPointOnPerimeter");
  const [idx1, point1] = pickPointOnPerimeter(square, 0.125);
  assert_eq(idx1, 0);
  assert_true(point1.nearly_equals(new PIXI.Vec(1, 4)));

  const [idx2, point2] = pickPointOnPerimeter(square, 0.5);
  assert_eq(idx2, 2);
  assert_true(point2.nearly_equals(square[2]));

  const [idx3, point3] = pickPointOnPerimeter(square, 0.9999999999999);
  assert_eq(idx3, 3);
  assert_true(point3.nearly_equals(square[0]));

  test_section("getVerticesPercPositions");
  const percs_square = getVerticesPercPositions(square);
  assert_eq(percs_square[0], 0.0);
  assert_eq(percs_square[1], 0.25);
  assert_eq(percs_square[2], 0.5);
  assert_eq(percs_square[3], 0.75);

  const percs_circle = getVerticesPercPositions(circle_r3_e1000);
  for (const [i, perc] of percs_circle.entries()) {
    // Test that pickPointOnPerimeter and getVerticesPercPositions are inverses
    assert_true(
      pickPointOnPerimeter(circle_r3_e1000, perc)[1].nearly_equals(
        circle_r3_e1000[i]
      )
    );
  }

  test_section("segmentSegmentIntersection");
  // s(egment)_h(orizontal) / v(ertical) / d(iagonal)
  const s_h = [new PIXI.Vec(0, 4), new PIXI.Vec(8, 4)];
  const s_h_far = [new PIXI.Vec(0, 400), new PIXI.Vec(8, 400)];
  const s_v = [new PIXI.Vec(4, 8), new PIXI.Vec(4, 0)];
  const s_v_far = [new PIXI.Vec(400, 8), new PIXI.Vec(400, 0)];
  const s_d = [new PIXI.Vec(0, 0), new PIXI.Vec(8, 8)];
  const s_d_far = [new PIXI.Vec(1000, 1000), new PIXI.Vec(800, 800)];

  const itx = new PIXI.Vec(4, 4);
  assert_true(
    segmentSegmentIntersection(s_h[0], s_h[1], s_v[0], s_v[1]).nearly_equals(
      itx
    )
  );

  assert_true(
    segmentSegmentIntersection(s_h[0], s_h[1], s_d[0], s_d[1]).nearly_equals(
      itx
    )
  );

  assert_true(
    segmentSegmentIntersection(s_d[0], s_d[1], s_v[0], s_v[1]).nearly_equals(
      itx
    )
  );

  assert_eq(
    segmentSegmentIntersection(s_d[0], s_d[1], s_v_far[0], s_v_far[1]),
    null
  );

  assert_eq(
    segmentSegmentIntersection(s_h_far[0], s_h_far[1], s_v_far[0], s_v_far[1]),
    null
  );

  assert_eq(
    segmentSegmentIntersection(s_d_far[0], s_d_far[1], s_d[0], s_d[1]),
    null
  );

  assert_true(
    segmentSegmentIntersection(
      s_d_far[0],
      s_d_far[1],
      s_d_far[0],
      s_d_far[1]
    ) !== null // self intersection
  );

  assert_eq(
    segmentSegmentIntersection(s_v[0], s_v[1], s_v_far[0], s_v_far[1]),
    null // self intersection
  );

  test_section("segmentPolygonIntersections");

  const sp_itx_h_sq = segmentPolygonIntersections(square, s_h[0], s_h[1]);
  assert_true(sp_itx_h_sq[0].equals(new PIXI.Vec(1, 4)));
  assert_true(sp_itx_h_sq[1].equals(new PIXI.Vec(7, 4)));

  const sp_itx_h_circle = segmentPolygonIntersections(
    circle_r3_e100000,
    s_h[0],
    s_h[1]
  );
  assert_true(sp_itx_h_circle[0].equals(new PIXI.Vec(7, 4)));
  assert_true(sp_itx_h_circle[1].equals(new PIXI.Vec(1, 4)));
} catch (error) {
  console.error(`TEST FAILED: ${error}`);
}
