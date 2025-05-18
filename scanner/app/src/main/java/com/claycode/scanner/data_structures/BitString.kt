/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

package com.claycode.scanner.data_structures

class BitString(private val bits: String) {
    init {
        require(bits.all { it == '0' || it == '1' }) { "BitString can only contain '0's and '1's." }
    }

    // Expose all String functions and operators
    operator fun get(index: Int): Char = bits[index]
    operator fun plus(other: BitString): BitString = BitString(bits + other.bits)
    fun slice(range: IntRange): BitString = BitString(bits.slice(range))
    val length: Int get() = bits.length
    fun isEmpty(): Boolean = bits.isEmpty()
    fun startsWith(other: BitString): Boolean = bits.startsWith(other.bits)
    fun endsWith(other: BitString): Boolean = bits.endsWith(other.bits)
    override fun toString(): String = bits
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as BitString
        return bits == other.bits
    }
    override fun hashCode(): Int { return bits.hashCode() }
}