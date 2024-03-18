import * as util from "./util.js";

const text_encoder = new TextEncoder("utf-8");
export function textToBits(input_text) {
  const encodedData = text_encoder.encode(input_text);

  return util.uint8ArrayToBitArray(encodedData);
}

const text_decoder = new TextDecoder();
export function bitsToText(bitArray) {
  const byteArray = util.bitArrayToByteArray(bitArray);

  return text_decoder.decode(new Uint8Array(byteArray));
}
