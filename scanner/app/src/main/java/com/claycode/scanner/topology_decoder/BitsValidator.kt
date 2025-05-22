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
 * Claycode's bit strings contain a CRC, that aim to discard false positives.
 * This function returns the inner bit string if the CRC pattern is satisfied, `null` otherwise
 */
class BitsValidator {
    companion object {
        val CRC_POLY = BitString("10100010110011001")

        fun computeCRC(inputBits: BitString, polynomialBits: BitString): BitString {
            val input = inputBits.toString().map { it.toString().toInt() }.toMutableList()
            val polynomial = polynomialBits.toString().map { it.toString().toInt() }.toMutableList()

            // Append zeros to the input equal to the length of the polynomial minus one
            for (i in 0 until polynomial.size - 1) {
                input.add(0)
            }

            // Process the input bits
            for (i in 0..(input.size - polynomial.size)) {
                if (input[i] == 1) { // Only perform XOR if the current bit is 1
                    for (j in polynomial.indices) {
                        input[i + j] = input[i + j] xor polynomial[j]
                    }
                }
            }

            // The remainder is the CRC, which is the last (polynomial.size - 1) bits of the modified input
            val crc = input.subList(input.size - polynomial.size + 1, input.size)

            return BitString(crc.joinToString(""))
        }

        fun getValidatedBitString(bits: BitString, polynomialBits: BitString = CRC_POLY): BitString? {
            if (bits.length < polynomialBits.length)
                return null // String too short to contain CRC

            val bitsWithoutCRC = bits.slice(0 until bits.length - polynomialBits.length + 1)
            val crc = bits.slice(bits.length - polynomialBits.length + 1 until bits.length)

            if (crc != computeCRC(bitsWithoutCRC, polynomialBits))
                return null

            return bitsWithoutCRC
        }
    }
}