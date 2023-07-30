import { textToBit } from "./text_bit/text_bit_UTF8.js";
import { bitsToTree } from "./bit_tree/bit_tree.js";

export function textToTree(text) {
  const bytes = textToBit(text);
  return bitsToTree(bytes);
}
