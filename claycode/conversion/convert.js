import * as text_bit_UTF8 from "./text_bits/text_bits_UTF8.js";
import * as text_bit_shoco from "./text_bits/text_bits_shoco.js";
import * as two_choices_mark from "./bits_tree/two_choices_mark.js";

/* This is the external interface of the conversion functions.
   Modify these functions to change the scenes behavior. */

export function textToBits(text) {
  // return text_bit_UTF8.textToBits(text);
  return text_bit_shoco.textToBits(text);
}

export function bitsToTree(bitsArray) {
  return two_choices_mark.bitsToTree(bitsArray);
}

export function textToTree(text) {
  const bitsArray = textToBits(text);
  return two_choices_mark.bitsToTree(bitsArray);
}
