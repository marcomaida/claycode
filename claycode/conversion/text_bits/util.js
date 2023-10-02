export function uint8ArrayToBitArray(rawBits) {
  const bitArray = [];
  rawBits.forEach((byte) => {
    for (let i = 7; i >= 0; i--) {
      const bitValue = (byte >> i) & 1;
      bitArray.push(bitValue);
    }
  });

  return bitArray;
}

export function bitArrayToByteArray(rawBits) {
  if (rawBits.length % 8 !== 0) {
    throw new Error("Invalid bits array length. It should be a multiple of 8.");
  }

  const bytesArray = [];
  let byteValue = 0;
  let bitPosition = 7;
  for (let i = 0; i < rawBits.length; i++) {
    byteValue |= rawBits[i] << bitPosition;
    bitPosition--;

    if (bitPosition < 0) {
      bytesArray.push(byteValue);
      byteValue = 0;
      bitPosition = 7;
    }
  }

  return bytesArray;
}
