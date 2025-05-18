/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */
package com.claycode.scanner

import com.claycode.scanner.data_structures.Tree
import com.claycode.scanner.topology_analysis.ClaycodeFinder
import com.claycode.scanner.topology_analysis.ClaycodeFinder.Companion.findNodesWithAtLeastNDescendants
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ClaycodeFinderUnitTest {
    // All nodes have a tower-height <= 3
    // Each tree has at least a node with tower-height >=1
    private val testTrees1 = listOf(
        "(())",
        "(()(()))",
        "(((())))",
        "(((()))(()))",
    )

    @Test
    fun findAllNodesWithTowerHeightOf_Basic() {
        // Define the function in a shorter form
        val f: (String, Int) -> List<Tree> = { treeStr, height ->
            ClaycodeFinder.findAllNodesWithTowerHeightGreaterThan(
                Tree.fromString(treeStr), height
            )
        }

        // Broad basic tests
        for (treeStr in testTrees1) {
            assertEquals(emptyList<Tree>(), f(treeStr, 6))
            assertEquals(emptyList<Tree>(), f(treeStr, 5))
            assertEquals(emptyList<Tree>(), f(treeStr, 4))
            assertTrue(f(treeStr, 1).isNotEmpty())
        }


        // Helper function to turn found trees into a sorted
        // array of string representations of the tree.
        // This makes it easier to build tests.
        val resf: (List<Tree>) -> Array<String> = {
            it.map { tree -> tree.toString() }
                .sorted()
                .toTypedArray()
        }

        // NOTE: in case the test fails, Android Studio seems to have
        // a weird behavior by which it changes the visualisation of the strings, e.g.,
        // assertArrayEquals(arrayOf("(())"), arrayOf("()"))
        // Gives the error:
        //    arrays first differed at element [0];
        //    Expected :([()])
        //    Actual   :([])
        // It is replacing the outer round brackets with square brackets.

        // let us first test a simple tower
        //        012345
        val t1 = "(((((())))))"
        assertArrayEquals(arrayOf("()"), resf(f(t1, 5)))
        assertArrayEquals(arrayOf("(())", "()"), resf(f(t1, 4)))
        assertArrayEquals(arrayOf("((()))", "(())", "()"), resf(f(t1, 3)))
        assertArrayEquals(arrayOf("(((())))", "((()))", "(())", "()"), resf(f(t1, 2)))
        assertArrayEquals(arrayOf("((((()))))", "(((())))", "((()))", "(())", "()"), resf(f(t1, 1)))
        assertArrayEquals(
            arrayOf("(((((())))))", "((((()))))", "(((())))", "((()))", "(())", "()"),
            resf(f(t1, 0))
        )

        // Next, a tower with a reset in the middle
        // tower: 0120 012
        val t2 = "(((()((())))))"
        assertArrayEquals(arrayOf(), resf(f(t2, 5)))
        assertArrayEquals(arrayOf(), resf(f(t2, 4)))
        assertArrayEquals(arrayOf(), resf(f(t2, 3)))
        assertArrayEquals(arrayOf("(()((())))", "()"), resf(f(t2, 2)))
        assertArrayEquals(
            arrayOf(
                "((()((()))))", "(()((())))",
                "(())", "()"
            ), resf(f(t2, 1))
        )

        // Next, a bi-forking tower with a reset in the middle
        // Note, it's the previous two tests together
        // tower: 0123456      0120 012
        val t3 = "((((((())))))(((()((()))))))"
        // Only left branch has these, same as t1
        assertArrayEquals(arrayOf("()"), resf(f(t3, 5)))
        assertArrayEquals(arrayOf("(())", "()"), resf(f(t3, 4)))
        assertArrayEquals(arrayOf("((()))", "(())", "()"), resf(f(t3, 3)))
        // Now, merge t1 and t2's. Mixed as they must be sorted.
        assertArrayEquals(arrayOf("(((())))", "((()))","(()((())))", "(())", "()", "()"), resf(f(t3, 2)))

        // A tree with a single 2-tower hidden in the middle
        // tower: 000 0 00 012     00 0 00 0
        val t4 = "((()()(()((()))))(()()(()())))"
        assertArrayEquals(arrayOf(), resf(f(t4, 5)))
        assertArrayEquals(arrayOf(), resf(f(t4, 4)))
        assertArrayEquals(arrayOf(), resf(f(t4, 3)))
        assertArrayEquals(arrayOf("()"), resf(f(t4, 2)))

    }


    @Test
    fun testFindNodesWithAtLeastNDescendants_Basic() {
        val f: (String, Int) -> List<Tree> = { treeStr, nDescendants ->
            findNodesWithAtLeastNDescendants(Tree.fromString(treeStr), nDescendants)
        }

        // Initial sparse tests
        val testTrees1 = listOf("(()(()))", "((()))", "(((())))", "((()()))")
        for (treeStr in testTrees1) {
            assertEquals(emptyList<Tree>(), f(treeStr, 6))
            assertEquals(emptyList<Tree>(), f(treeStr, 5))
            assertTrue(f(treeStr, 1).isNotEmpty())
        }

        // Helper function to get sorted results, as we do not require the function
        // to return results in a specific way
        val resf: (List<Tree>) -> Array<String> = {
            it.map { tree -> tree.toString() }
                .sorted()
                .toTypedArray()
        }

        val t1 = "()"
        assertArrayEquals(arrayOf("()"), resf(f(t1, 1)))
        assertEquals(emptyList<Tree>(), f(t1, 2))

        val t2 = "(((((())))))" // tower of 6
        assertEquals(emptyList<Tree>(), f(t2, 7))
        assertArrayEquals(arrayOf("(((((())))))"), resf(f(t2, 6)))
        assertArrayEquals(arrayOf("(((((())))))", "((((()))))"), resf(f(t2, 5)))
        assertArrayEquals(arrayOf("(((((())))))", "((((()))))", "(((())))"), resf(f(t2, 4)))

        val t3 = "(((()()()()())))"  // tower of 3, with 5 leaves at the end
        assertEquals(emptyList<Tree>(), f(t3, 9))
        assertArrayEquals(arrayOf("(((()()()()())))", "((()()()()()))", "(()()()()())"), resf(f(t3, 5)))

        val t4 = "((()())(()()))"  // Fully balanced binary tree with height 3
        assertArrayEquals(arrayOf("((()())(()()))", "(()())", "(()())", "()","()","()","()"), resf(f(t4, 1)))
        assertArrayEquals(arrayOf("((()())(()()))", "(()())", "(()())"), resf(f(t4, 2)))
        assertArrayEquals(arrayOf("((()())(()()))", "(()())", "(()())"), resf(f(t4, 3)))
        assertArrayEquals(arrayOf("((()())(()()))"), resf(f(t4, 4)))
    }
}
