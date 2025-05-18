/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

Math.lerp = function (a, b, t) {
  return a + (b - a) * t;
};

Math.sum = function (array) {
  return array.reduce((a, b) => a + b, 0);
};

Math.normalise = function (array) {
  const total = Math.sum(array);
  return array.map((v) => v / total);
};
