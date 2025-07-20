/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { BitString } from "./bit_string.js";

/**
 * Common BitsValidator class used by both scanner and generator
 */
export class BitsValidator {
    static CRC_POLY = new BitString("10100010110011001"); // 0x4599 CAN's standard
    
    static getValidatedBitString(bits, polynomialBits = this.CRC_POLY) {
        if (!bits || bits.length < polynomialBits.length) {
            return null;
        }
        
        const bitsWithoutCRC = bits.slice(0, bits.length - polynomialBits.length + 1);
        const crc = bits.slice(bits.length - polynomialBits.length + 1);
        
        const computedCRC = this.computeCRC(bitsWithoutCRC, polynomialBits);
        
        if (crc.toString() !== computedCRC.toString()) {
            return null;
        }
        
        return bitsWithoutCRC;
    }
    
    static computeCRC(inputBits, polynomialBits) {
        const input = inputBits.toString().split('').map(b => parseInt(b));
        const polynomial = polynomialBits.toString().split('').map(b => parseInt(b));
        
        // Append zeros
        for (let i = 0; i < polynomial.length - 1; i++) {
            input.push(0);
        }
        
        // Process bits
        for (let i = 0; i <= input.length - polynomial.length; i++) {
            if (input[i] === 1) {
                for (let j = 0; j < polynomial.length; j++) {
                    input[i + j] ^= polynomial[j];
                }
            }
        }
        
        // Extract CRC
        const crc = input.slice(input.length - polynomial.length + 1);
        return new BitString(crc.join(''));
    }

    static addCRC(bits) {
        if (bits instanceof BitString) {
            const bitArray = bits.toString().split('').map(b => parseInt(b));
            const crcBits = this.computeCRC(bits, this.CRC_POLY);
            const crcArray = crcBits.toString().split('').map(b => parseInt(b));
            return new BitString([...bitArray, ...crcArray].join(''));
        } else if (Array.isArray(bits)) {
            const crcArray = this.computeCRC(new BitString(bits.join('')), this.CRC_POLY)
                .toString().split('').map(b => parseInt(b));
            return [...bits, ...crcArray];
        }
        throw new Error("Input must be a BitString or an array of bits");
    }
}