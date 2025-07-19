/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import * as util from "./util.js";
import * as crc from "./crc.js"

// Used by sample generator
export function getDescription() {
  return `UTF8, CRC: ${crc.getDescription()}`
}

const text_encoder = new TextEncoder("utf-8");
export function textToBits(input_text) {
  const encodedData = text_encoder.encode(input_text);
  let bitArrayWithCRC = crc.addCRC(util.uint8ArrayToBitArray(encodedData));
  
  return bitArrayWithCRC
}

const text_decoder = new TextDecoder();
export function bitsToText(bitArray) {
  let bitArrayWithoutCRC = crc.removeCRC(bitArray)
  const byteArray = util.bitArrayToByteArray(bitArrayWithoutCRC);

  return text_decoder.decode(new Uint8Array(byteArray));
}
