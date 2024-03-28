package com.claycode.scanner

import com.claycode.scanner.tree_conversion_lib.Tree
import org.junit.Assert.*
import org.junit.Test

/**
 * Testing the tree class
 */
class TreeUnitTest {
    @Test
    fun tree_fromToString() {
        val testTrees = arrayOf(
            "()",
            "(()())",
            "(()()((((())))))",
            "((()))",
        )
        for (treeString in testTrees) {
            assertEquals(treeString, Tree.fromString((treeString)).toString())
        }
    }
    @Test
    fun tree_fromInvalidString() {
        val testTrees = arrayOf(
            ")",
            "())",
            "(((",
            "((())",
            "()()",
            "",
        )

        for (treeString in testTrees) {
            assertThrows(IllegalArgumentException::class.java) {
               assertEquals(treeString, Tree.fromString((treeString)).toString())
            }
        }
    }
}