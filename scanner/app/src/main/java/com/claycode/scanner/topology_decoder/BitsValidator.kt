package com.claycode.scanner.topology_decoder

import com.claycode.scanner.data_structures.BitString

/**
 * Claycode's bit strings are padded with a sync pattern,
 * that aim to discard false positives.
 * This function returns the inner bit string if the sync pattern
 * is satisfied, `null` otherwise
 */
class BitsValidator {
    companion object {
        val PREFIX_BITS = BitString("0000")
        val SUFFIX_BITS = BitString("0000")

        fun getValidatedBitString(bits: BitString): BitString? {
            return if (bits.length >= PREFIX_BITS.length + SUFFIX_BITS.length &&
                bits.startsWith(PREFIX_BITS) && bits.endsWith(SUFFIX_BITS)
            ) {
                bits.slice(
                    IntRange(
                        PREFIX_BITS.length,
                        bits.length - SUFFIX_BITS.length - 1
                    )
                )
            } else null
        }
    }
}