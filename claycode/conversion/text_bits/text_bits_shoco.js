import * as util from "./util.js";

export function textToBits(input_text) {
  const encodedData = shoco_en.compress(input_text);

  return util.uint8ArrayToBitArray(encodedData);
}

export function bitsToText(bitArray) {
  const byteArray = util.bitArrayToByteArray(bitArray);

  return shoco_en.decompress(new Uint8Array(byteArray));
}
