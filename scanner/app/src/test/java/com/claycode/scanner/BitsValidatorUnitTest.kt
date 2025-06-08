/*
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */
package com.claycode.scanner

import com.claycode.scanner.data_structures.BitString
import com.claycode.scanner.topology_decoder.BitsValidator
import org.junit.Assert.assertEquals
import org.junit.Test
import kotlin.random.Random

class BitsValidatorUnitTest {

    // Ground truth is taken from the Generator's code.
    // The format is (message, polynomial, CRC)
    val groundTruth = arrayOf(
        Triple("00110","111","11"),
        Triple("1110110001","1001","000"),
        Triple("001111111011111","11010","1100"),
        Triple("10101000001110101111","101000","01000"),
        Triple("1100111001010011111111010","1010001","100011"),
        Triple("000000000000000011001010110100","10110001","1110000"),
        Triple("11010010111000100000110000011011010","101111011","01101101"),
        Triple("1000101001001010100001011100111011000010","1001000111","111101000"),
        Triple("000100101100010101110100101011110110010001000","10100010001","1011001110"),
        Triple("00111110110010001101110001001101110010100101110001","100011000011","01110101110")
    )

    @Test
    fun bitString_CRC() {
        for ((message, polynomial, crc) in groundTruth) {
            assertEquals(BitString(crc), BitsValidator.computeCRC(BitString(message), BitString(polynomial)))
        }
    }
    @Test
    fun bitsValidator_expectResultWhenSyncPatternIsRight() {
        for ((message, polynomial, crc) in groundTruth) {
            val messageWithCRC = message+crc
            assertEquals(BitString(message), BitsValidator.getValidatedBitString(BitString(messageWithCRC), BitString(polynomial)))
        }
    }

    @Test
    fun bitsValidator_expectResultWhenSyncPatternIsWrong() {
        // Flip a random bit in the string, and check that the CRC detects it.
        val random = Random(1234)
        for ((message, polynomial, crc) in groundTruth) {
            val messageWithCRC = message+crc
            val indexToFlip = random.nextInt(messageWithCRC.length)
            val corruptedMessageWithCRC = messageWithCRC.mapIndexed { index, char ->
                if (index == indexToFlip) { if (char == '0') '1' else '0' } else { char }
            }.joinToString("")

            assertEquals(null, BitsValidator.getValidatedBitString(BitString(corruptedMessageWithCRC), BitString(polynomial)))
        }
    }


}
