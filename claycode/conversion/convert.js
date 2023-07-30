import * as text_bit_UTF8 from "./text_bit/text_bit_UTF8.js";
import * as bit_tree from "./bit_tree/bit_tree.js";

/* This is the external interface of the conversion functions.
   Modify these functions to change the scenes behavior. */

export function textToBit(text) {
  return text_bit_UTF8.textToBit(text);
}

export function bitsToTree(bitsArray) {
  return bit_tree.bitsToTree(bitsArray);
}

export function textToTree(text) {
  const bitsArray = textToBit(text);
  return bitsToTree(bitsArray);
}
