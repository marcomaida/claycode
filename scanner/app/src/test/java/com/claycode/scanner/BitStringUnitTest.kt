package com.claycode.scanner

import com.claycode.scanner.tree_conversion.BitString
import org.junit.Assert.*
import org.junit.Test


class BitStringUnitTest {

    @Test
    fun bitString_Basic() {
        val bitStrings = arrayOf(
            "", "0", "1", "01", "10",  "00", "11",
            "110010", "00000", "11111", "010101", "101010",
            "11001010011011010101", "01001010010010100100",
        )

        for (original in bitStrings) {
            assertEquals(original, BitString(original).toString())
            assertEquals(original.length, BitString(original).length)
        }
    }

    @Test
    fun bitString_Invalid() {
        val bitStrings = arrayOf(
            "0a", "1b", "01.", "0b10",
            "aa", "123", "ONE", "o","O",
        )

        for (original in bitStrings) {
            assertThrows(IllegalArgumentException::class.java) {
                BitString(original)
            }
        }
    }
}