/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import * as text_bit_UTF8 from "./text_bits/text_bits_UTF8.js";
import * as square from "./bits_tree/square.js";

/* This is the external interface of the conversion functions.
   Modify these functions to change the scenes behavior. */

export function textToBits(text) {
  return text_bit_UTF8.textToBits(text);
}
export function bitsToText(bits) {
  return text_bit_UTF8.bitsToText(bits);
}

export function bitsToTree(bitsArray) {
  return square.bitsToTree(bitsArray);
}
export function treeToBits(tree) {
  return square.treeToBits(tree);
}

export function textToTree(text) {
  const bitsArray = textToBits(text);
  return bitsToTree(bitsArray);
}
export function treeToText(tree) {
  const bitsArray = treeToBits(tree);
  return bitsToText(bitsArray);
}

// Used by sample generator
export function getDescription() {
  return `Text-bit: ${text_bit_UTF8.getDescription()}, Bit-tree: ${square.getDescription()} `
}