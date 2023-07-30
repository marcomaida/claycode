const text_encoder = new TextEncoder("utf-8");
export function textToBits(input_text) {
  const encodedData = text_encoder.encode(input_text);

  const bitsArray = [];
  encodedData.forEach((byte) => {
    for (let i = 7; i >= 0; i--) {
      const bitValue = (byte >> i) & 1;
      bitsArray.push(bitValue);
    }
  });

  return bitsArray;
}

const text_decoder = new TextDecoder();
export function bitsToText(bitsArray) {
  if (bitsArray.length % 8 !== 0) {
    throw new Error("Invalid bits array length. It should be a multiple of 8.");
  }

  const bytesArray = [];
  let byteValue = 0;
  let bitPosition = 7;
  for (let i = 0; i < bitsArray.length; i++) {
    byteValue |= bitsArray[i] << bitPosition;
    bitPosition--;

    if (bitPosition < 0) {
      bytesArray.push(byteValue);
      byteValue = 0;
      bitPosition = 7;
    }
  }

  return text_decoder.decode(new Uint8Array(bytesArray));
}
