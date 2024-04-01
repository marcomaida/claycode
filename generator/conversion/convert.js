import * as text_bit_UTF8 from "./text_bits/text_bits_UTF8.js";
import * as square from "./bits_tree/square.js";

const PREFIX_BITS = [0, 0, 0, 0]
const SUFFIX_BITS = [0, 0, 0, 0]

function addSyncPattern(bits) {
  bits.unshift(...PREFIX_BITS)
  bits.push(...SUFFIX_BITS)
  return bits
}

function removeSyncPattern(bits) {
  let pre = PREFIX_BITS.length
  let post = SUFFIX_BITS.length
  
  if (
    bits.length < PREFIX_BITS.length + SUFFIX_BITS.length ||
    bits.slice(0, pre).toString() != PREFIX_BITS.toString() ||
    bits.slice(-post, bits.length).toString() != SUFFIX_BITS.toString()
  ) {
    throw Error(`Sync pattern not present in bits ${bits}`)
  }

  return bits.slice(pre, -post)
}

/* This is the external interface of the conversion functions.
   Modify these functions to change the scenes behavior. */

export function textToBits(text) {
  return addSyncPattern(
    text_bit_UTF8.textToBits(text)
  );
}
export function bitsToText(bits) {
  return text_bit_UTF8.bitsToText(
    removeSyncPattern(bits)
  );
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
