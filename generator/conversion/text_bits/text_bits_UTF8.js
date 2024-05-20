import * as util from "./util.js";
import * as crc from "./crc.js"

const text_encoder = new TextEncoder("utf-8");
export function textToBits(input_text) {
  const encodedData = text_encoder.encode(input_text);
  let bitArrayWithCRC = crc.addCRC(util.uint8ArrayToBitArray(encodedData));
  
  return bitArrayWithCRC
}

const text_decoder = new TextDecoder();
export function bitsToText(bitArray) {
  let bitArrayWithoutCRC = crc.removeCRC(bitArray)
  const byteArray = util.bitArrayToByteArray(bitArrayWithoutCRC);

  return text_decoder.decode(new Uint8Array(byteArray));
}
