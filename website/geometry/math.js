/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

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
