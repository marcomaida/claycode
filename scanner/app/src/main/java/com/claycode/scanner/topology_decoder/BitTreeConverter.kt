/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

package com.claycode.scanner.topology_decoder

import android.os.Build
import androidx.annotation.RequiresApi
import com.claycode.scanner.data_structures.BitString
import com.claycode.scanner.data_structures.Tree
import java.math.BigInteger

/**
 * This class provides conversions between bits and trees.
 * Bits are represented as strings of zeros and ones.
 */
class BitTreeConverter {
    companion object {
        fun bitsToTree(bits: BitString): Tree {
            @RequiresApi(Build.VERSION_CODES.TIRAMISU)
            fun populateTreeOfNumber(root: Tree, n: BigInteger) {
                val dec = numberToSquareDecomposition(n)
                root.children = dec.map { Tree() }.toMutableList()
                root.children.forEachIndexed { i, c ->
                    populateTreeOfNumber(c, dec[i])
                }
            }

            val root = Tree()
            val n = bitStringToNumber(bits)
            populateTreeOfNumber(root, n)

            return root
        }

        fun treeToBits(root: Tree): BitString {
            fun treeToNumber(root: Tree): BigInteger {
                if (root.children.isEmpty()) {
                    return BigInteger.ONE
                } else {
                    val dec = root.children.map { treeToNumber(it) }
                    return squareDecompositionToNumber(dec)
                }
            }

            return numberToBitString(treeToNumber(root))
        }

        private fun bitStringToNumber(bits: BitString): BigInteger {
            // Prepend 1 to make sure it is an integer
            return BigInteger("1${bits.toString()}", 2)
        }

        private fun numberToBitString(number: BigInteger): BitString {
            // Remove initial 1
            return BitString(number.toString(2).substring(1))
        }

        @RequiresApi(Build.VERSION_CODES.TIRAMISU)
        private fun largestSquare(n: BigInteger): BigInteger {
            if (n == BigInteger.ONE) return BigInteger.ONE

            var a = BigInteger.ZERO
            var b = n
            while (true) {
                val r = a + (b - a) / BigInteger.TWO
                val rsq = r * r
                if (rsq <= n && (r + BigInteger.ONE).pow(2) > n) {
                    return r
                } else {
                    if (rsq <= n) {
                        a = r
                    } else {
                        b = r
                    }
                }
            }
        }

        @RequiresApi(Build.VERSION_CODES.TIRAMISU)
        private fun numberToSquareDecomposition(n: BigInteger): List<BigInteger> {
            var num = n - BigInteger.ONE
            val dec = mutableListOf<BigInteger>()
            while (num > BigInteger.ZERO) {
                val lsq = largestSquare(num)
                dec.add(lsq)
                num -= lsq.pow(2)
            }
            return dec
        }

        private fun squareDecompositionToNumber(dec: List<BigInteger>): BigInteger {
            return dec.sumOf { num -> num.pow(2) } + BigInteger.ONE
        }
    }
}
