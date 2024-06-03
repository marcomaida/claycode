// https://reveng.sourceforge.io/crc-catalogue/all.htm
export const CRC_POLY = [1,0,1,0,0,0,1,0,1,1,0,0,1,1,0,0,1] // (16 bits, 0x4599 - CAN's standard, including leading '1')

// Used by sample generator
export function getDescription() {
  return `0x${parseInt(CRC_POLY.join("").slice(1), 2).toString(16)}`
}

export function computeCRC(inputBits, polynomialBits) {
    let input = inputBits.slice(); // Copy the input bits array
    let polynomial = polynomialBits.slice(); // Copy the polynomial bits array

    // Append zeros to the input equal to the length of the polynomial minus one
    for (let i = 0; i < polynomial.length - 1; i++) {
        input.push(0);
    }

    // Process the input bits
    for (let i = 0; i <= input.length - polynomial.length; i++) {
        if (input[i] === 1) { // Only perform XOR if the current bit is 1
            for (let j = 0; j < polynomial.length; j++) {
                input[i + j] = input[i + j] ^ polynomial[j];
            }
        }
    }

    // The remainder is the CRC, which is the last (polynomial.length - 1) bits of the modified input
    let crc = input.slice(input.length - polynomial.length + 1);

    return crc;
}

export function addCRC(bits) {
  bits.push(...computeCRC(bits, CRC_POLY));
  return bits;
}

export function removeCRC(bits) {
  if (bits.length < CRC_POLY.length) {
    throw Error(`String is shorter than CRC!`);
  }

  let bitsWithoutCRC = bits.slice(0, -CRC_POLY.length+1);
  let CRC = bits.slice(-CRC_POLY.length, CRC_POLY.length)
  if (JSON.stringify(computeCRC(bitsWithoutCRC, CRC_POLY)) === JSON.stringify(CRC)) {
    throw Error(`CRC does not match!`);
  }

  return bitsWithoutCRC;
}