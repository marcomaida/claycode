package com.claycode.scanner

import com.claycode.scanner.data_structures.BitString
import com.claycode.scanner.topology_decoder.TextBitsConverter
import org.junit.Assert.assertEquals
import org.junit.Test

class TextBitsUnitTest {

    // A list of strings to be converted back and forth, to validate integrity
    private var testCases = mutableListOf(
        "Hello",
        "こんにちは", // Japanese characters
        "Привет", // Russian characters
        "1234567890", // Numerical values
        "!@#$%^&*()_+", // Special characters
        " ", // Single space
        "Long string with multiple words, spaces, and punctuation marks.",
        "中文也很重要", // Chinese characters
        "emoji 👍🏽", // String with emojis
        "New\nLine", // String with a new line character
        "Tab\tCharacter", // String with a tab character
        "Français, Español, Deutsch", // String with accented characters
        "Zażółć gęślą jaźń", // Polish characters with accents
        "VeryVeryLongStringVeryVeryLongStringVeryVeryLong123123StringVeryVeryLongStringVeryVeryLongStringVeryVeryLongString"
    )

    // Those come from the Claycode generator
    private val knownConversions = listOf(
        Pair("ABC","010000010100001001000011"),
        Pair("Hello World","0100100001100101011011000110110001101111001000000101011101101111011100100110110001100100"),
        Pair("123123","001100010011001000110011001100010011001000110011"),
        Pair("www.maida.me/treecode","011101110111011101110111001011100110110101100001011010010110010001100001001011100110110101100101001011110111010001110010011001010110010101100011011011110110010001100101"),
        Pair("1dog+3cats=4pets😊","0011000101100100011011110110011100101011001100110110001101100001011101000111001100111101001101000111000001100101011101000111001111110000100111111001100010001010"),
    )

    @Test
    fun bitTree_checkIntegrity() {
        for (original in testCases) {
            assertEquals(
                original,
                TextBitsConverter.bitsToText(
                    TextBitsConverter.textToBits(original)
                )
            )
        }
    }

    @Test
    fun bitTree_checkEqualityWithClaycodeGenerator() {
        for ((original, generated) in knownConversions) {
            assertEquals(
                TextBitsConverter.textToBits(original),
                BitString(generated)
            )
        }
    }
}
