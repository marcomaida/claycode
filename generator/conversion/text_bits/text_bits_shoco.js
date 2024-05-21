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
