/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import * as util from "./util.js";
import {} from "./compression/shoco_en.js";

// Used by sample generator
export function getDescription() {
  return "Shoco"
}

export function textToBits(input_text) {
  const encodedData = shoco_en.compress(input_text);

  return util.uint8ArrayToBitArray(encodedData);
}

export function bitsToText(bitArray) {
  const byteArray = util.bitArrayToByteArray(bitArray);

  return shoco_en.decompress(new Uint8Array(byteArray));
}
