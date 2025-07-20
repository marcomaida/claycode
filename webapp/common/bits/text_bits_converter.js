/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { BitString } from "./bit_string.js";
import { BitsValidator } from "./bits_validator.js";

/**
 * Common TextBitsConverter class used by both scanner and generator
 */
export class TextBitsConverter {
    static textEncoder = new TextEncoder("utf-8");
    static textDecoder = new TextDecoder("utf-8");
    
    static bitsToText(bits) {
        if (!bits) return "";
        
        // Convert array to string if needed
        let bitString;
        if (Array.isArray(bits)) {
            bitString = bits.join('');
        } else if (bits instanceof BitString) {
            bitString = bits.toString();
        } else if (typeof bits === 'string') {
            bitString = bits;
        } else {
            return "[Claycode] Invalid bit format";
        }
        
        try {
            // Split into 8-bit chunks and convert to bytes
            const chunks = bitString.match(/.{1,8}/g) || [];
            const bytes = [];
            
            for (const chunk of chunks) {
                if (chunk.length === 8) {
                    bytes.push(parseInt(chunk, 2));
                }
            }
            
            // Convert bytes to UTF-8 string
            const uint8Array = new Uint8Array(bytes);
            return this.textDecoder.decode(uint8Array);
        } catch (e) {
            return `[Claycode] ${bitString.length} bits`;
        }
    }

    static textToBits(text) {
        const encodedData = this.textEncoder.encode(text);
        const bitArray = this.uint8ArrayToBitArray(encodedData);
        return BitsValidator.addCRC(bitArray);
    }

    static uint8ArrayToBitArray(uint8Array) {
        const bitArray = [];
        for (let i = 0; i < uint8Array.length; i++) {
            const byte = uint8Array[i];
            for (let j = 7; j >= 0; j--) {
                bitArray.push((byte >> j) & 1);
            }
        }
        return bitArray;
    }

    static bitArrayToByteArray(bitArray) {
        const byteArray = [];
        for (let i = 0; i < bitArray.length; i += 8) {
            if (i + 8 <= bitArray.length) {
                let byte = 0;
                for (let j = 0; j < 8; j++) {
                    byte = (byte << 1) | bitArray[i + j];
                }
                byteArray.push(byte);
            }
        }
        return byteArray;
    }
}