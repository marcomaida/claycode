import * as text_bit_UTF8 from "./text_bits/text_bits_UTF8.js";
import * as bits_tree from "./bits_tree/bits_tree.js";

/* This is the external interface of the conversion functions.
   Modify these functions to change the scenes behavior. */

export function textToBits(text) {
  return text_bit_UTF8.textToBits(text);
}

export function bitsToTree(bitsArray) {
  return bits_tree.bitsToTree(bitsArray);
}

export function textToTree(text) {
  const bitsArray = textToBits(text);
  return bitsToTree(bitsArray);
}
