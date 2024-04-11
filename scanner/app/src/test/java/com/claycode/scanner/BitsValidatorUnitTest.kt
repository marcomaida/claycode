package com.claycode.scanner

import com.claycode.scanner.data_structures.BitString
import com.claycode.scanner.topology_decoder.BitsValidator
import org.junit.Assert.assertEquals
import org.junit.Test

class BitsValidatorUnitTest {
    private var bitStrings = mutableListOf(
        "", "0", "1", "01", "10", "00", "11",
        "110010", "00000", "11111", "010101", "101010",
        "11001010011011010101", "01001010010010100100",
    )
    @Test
    fun bitsValidator_expectResultWhenSyncPatternIsRight() {
        val pad : (String) -> BitString = {BitsValidator.PREFIX_BITS + BitString(it) + BitsValidator.SUFFIX_BITS}

        for (bits in bitStrings) {
            assertEquals(BitString(bits), BitsValidator.getValidatedBitString(pad(bits)))
        }
    }
    @Test
    fun bitsValidator_expectResultWhenSyncPatternIsWrong() {
        // NOTE: this test will break if the prefix or suffix are set to an empty string.
        val flipLastBit: (BitString) -> BitString = { bitString ->
            val lastBitIndex = bitString.length - 1
            val newLastBit = if (bitString[lastBitIndex] == '1') "0" else "1"
            bitString.slice(IntRange(0, lastBitIndex-1)) + BitString(newLastBit)
        }

        // Three padding functions adding a mistake in the prefix, in the suffix, and in both
        val pad_pre : (String) -> BitString = {flipLastBit(BitsValidator.PREFIX_BITS) + BitString(it) + BitsValidator.SUFFIX_BITS}
        val pad_suf : (String) -> BitString = {BitsValidator.PREFIX_BITS + BitString(it) + flipLastBit(BitsValidator.SUFFIX_BITS)}
        val pad_both : (String) -> BitString = {flipLastBit(BitsValidator.PREFIX_BITS) + BitString(it) + flipLastBit(BitsValidator.SUFFIX_BITS)}

        for (bits in bitStrings) {
            assertEquals(null, BitsValidator.getValidatedBitString(pad_pre(bits)))
            assertEquals(null, BitsValidator.getValidatedBitString(pad_suf(bits)))
            assertEquals(null, BitsValidator.getValidatedBitString(pad_both(bits)))
        }
    }
}
