import * as text_bit_shoco from "./text_bits/text_bits_shoco.js";
import * as square from "./bits_tree/square.js";

/* This is the external interface of the conversion functions.
   Modify these functions to change the scenes behavior. */

export function textToBits(text) {
  return text_bit_shoco.textToBits(text);
}
export function bitsToText(bits) {
  return text_bit_shoco.bitsToText(bits);
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
