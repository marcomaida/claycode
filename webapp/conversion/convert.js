/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

// Import from common library
import { BitString, BitsValidator, TextBitsConverter, BitTreeConverter } from '../common/index.js';

/* This is the external interface of the conversion functions.
   Modify these functions to change the scenes behavior. */

export function textToBits(text) {
  return TextBitsConverter.textToBits(text);
}

export function bitsToText(bits) {
  const bitString = bits instanceof BitString
    ? bits
    : new BitString(Array.isArray(bits) ? bits.join('') : bits);
  const validatedBits = BitsValidator.getValidatedBitString(bitString);

  return validatedBits ? TextBitsConverter.bitsToText(validatedBits) : "";
}

export function bitsToTree(bitsArray) {
  return BitTreeConverter.bitsToTree(bitsArray);
}

export function treeToBits(tree) {
  return BitTreeConverter.treeToBits(tree).toString().split('').map(Number);
}

export function textToTree(text) {
  const bitsArray = textToBits(text);
  return bitsToTree(bitsArray);
}

export function treeToText(tree) {
  const bitsArray = treeToBits(tree);
  return bitsToText(bitsArray);
}

// Used by sample webapp
export function getDescription() {
  return `Using common library for text-bit and bit-tree conversions`;
}
