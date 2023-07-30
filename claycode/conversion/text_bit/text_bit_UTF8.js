const text_encoder = new TextEncoder("utf-8");
export function textToBit(input_text) {
  return text_encoder.encode(input_text);
}

const text_decoder = new TextDecoder();
export function bitToText(bits) {
  return text_decoder.decode(bits);
}
