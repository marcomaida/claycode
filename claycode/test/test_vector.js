import {} from "../geometry/vector.js";
import { assert_true, test_section, test_heading } from "./test_utils.js";

try {
  test_heading("Vector");
  test_section("Vec.nearly_equals");
  assert_true(new PIXI.Vec(1, 1).nearly_equals(new PIXI.Vec(1, 1)));
  assert_true(new PIXI.Vec(1, 1).nearly_equals(new PIXI.Vec(1, 1)));

  test_section("Vec.lerp");
  assert_true(
    new PIXI.Vec(1, 1)
      .lerp(new PIXI.Vec(2, 2), 0.5)
      .nearly_equals(new PIXI.Vec(1.5, 1.5))
  );
  assert_true(
    new PIXI.Vec(-1, -2)
      .lerp(new PIXI.Vec(1, -2), 0.4)
      .nearly_equals(new PIXI.Vec(-0.2, -2))
  );
} catch (error) {
  console.error(`TEST FAILED: ${error}`);
}
