/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */
package com.claycode.scanner

import com.claycode.scanner.data_structures.BitString
import com.claycode.scanner.topology_decoder.BitTreeConverter
import org.junit.Assert.assertEquals
import org.junit.Test

class BitTreeUnitTest {
    private var bitStrings = mutableListOf(
        "", "0", "1", "01", "10", "00", "11",
        "110010", "00000", "11111", "010101", "101010",
        "11001010011011010101", "01001010010010100100",
    )

    private val knownConversions = listOf(
        Pair("1", "(()())"),
        Pair("01", "((()))"),
        Pair("10", "((())())"),
        Pair("11", "((())()())"),
        Pair("100", "((()())()())"),
        Pair("101", "((()())()()())"),
        Pair("110", "((()())(()))"),
        Pair("111", "((()())(())())"),
        Pair("010101010101", "((((())()()())(())(()))((()())())(()())())"),
        Pair("0000000000", "((((()))(())())((())()())(()())(()))"),
        Pair("1111111111", "((((())())(())(()))(()()())(())())"),
    )

    init {
        for (i in 1..1000) {
            var currStr = ""
            for (idx in 0..i) {
                currStr += if (Math.random() < 0.5) "0" else "1"
            }
            bitStrings.add(currStr)
        }
    }

    @Test
    fun bitTree_Basic() {
        for (original in bitStrings) {
            assertEquals(
                BitString(original),
                BitTreeConverter.treeToBits(
                    BitTreeConverter.bitsToTree(BitString(original))
                )
            )
        }
    }

    @Test
    fun bitTree_CheckKnownTree() {
        for (conversion in knownConversions) {
            assertEquals(
                conversion.second,
                BitTreeConverter.bitsToTree(
                    BitString(conversion.first)
                ).toString(),
            )
        }
    }
}
