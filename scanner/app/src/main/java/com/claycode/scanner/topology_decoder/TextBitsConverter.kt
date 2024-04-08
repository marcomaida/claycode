package com.claycode.scanner.topology_decoder

import com.claycode.scanner.data_structures.BitString

/**
 * This class provides conversions between text and bits.
 * Bits are represented as strings of zeros and ones.
 */
class TextBitsConverter {
    companion object {
        fun TextToBits(text: String): BitString {
            throw NotImplementedError()
        }

        fun BitsToText(bits: BitString): String {
            throw NotImplementedError()
        }
    }
}