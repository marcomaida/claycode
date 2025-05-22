/*
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

package com.claycode.scanner.topology_decoder

import com.claycode.scanner.data_structures.BitString

/**
 * This class provides conversions between text and bits.
 * Bits are represented as strings of zeros and ones.
 */
class TextBitsConverter {
    companion object {
        fun textToBits(text: String): BitString {
            val bytes = text.toByteArray(Charsets.UTF_8)
            val binaryStr = bytes.joinToString(separator = "") { byte ->
                String.format(
                    "%8s", byte.toInt()    // Convert to int
                        .and(255)    // keep last 8 bits only
                        .toString(2) // turn into binary digit
                ).replace(' ', '0') // Ensures leading zeros are maintained
            }
            return BitString(binaryStr)
        }

        fun bitsToText(bits: BitString): String {
            // Split the binary string into 8-bit segments that correspond to bytes
            val bytes = bits.toString().chunked(8).map { it.toInt(2).toByte() }.toByteArray()
            // Convert byte array back to string using UTF-8 encoding
            return String(bytes, Charsets.UTF_8)
        }
    }
}