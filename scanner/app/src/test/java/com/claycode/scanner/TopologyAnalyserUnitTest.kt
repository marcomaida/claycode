package com.claycode.scanner

import com.claycode.scanner.data_structures.Graph
import com.claycode.scanner.data_structures.Tree
import com.claycode.scanner.topology_analysis.TopologyAnalyser
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Testing the topology extractor algorithm.
 * The following test numbers do not carry any intrinsic meaning: they reflect the
 * dataset of topologies currently placed under `experiments/scanner/lab/topologies/`
 */
class TopologyAnalyserUnitTest {
    @Test
    fun test3() {
        val g3 = Graph(5)
        g3.addEdge(0, 1)
        g3.addEdge(0, 2)
        g3.addEdge(1, 2)
        g3.addEdge(1, 3)
        g3.addEdge(2, 3)
        g3.addEdge(3, 4)
        val parents3 = arrayOf(0, 0, 0, 0, 3)
        val tree3 = Tree.fromString("(()()(()))")

        assertArrayEquals(parents3, TopologyAnalyser.buildParentsArrayFromTouchGraph(g3, 0))
        assertEquals(tree3.toString(), TopologyAnalyser.buildTreeFromParentsArray(parents3, 0).toString())
    }

    @Test
    fun test4() {
        val g4 = Graph(7)
        g4.addEdge(0, 1)
        g4.addEdge(0, 2)
        g4.addEdge(0, 3)
        g4.addEdge(0, 4)
        g4.addEdge(1, 2)
        g4.addEdge(1, 3)
        g4.addEdge(1, 4)
        g4.addEdge(1, 5)
        g4.addEdge(2, 3)
        g4.addEdge(3, 4)
        g4.addEdge(4, 5)
        g4.addEdge(5, 6)
        val parents4 = arrayOf(0, 0, 0, 0, 0, 0, 5)
        val tree4 = Tree.fromString("(()()()()(()))")

        assertArrayEquals(parents4, TopologyAnalyser.buildParentsArrayFromTouchGraph(g4, 0))
        assertEquals(tree4.toString(), TopologyAnalyser.buildTreeFromParentsArray(parents4, 0).toString())
    }

    @Test
    fun test8() {
        val g8 = Graph(3)
        g8.addEdge(0, 1)
        g8.addEdge(0, 2)
        g8.addEdge(1, 2)
        val parents8 = arrayOf(1, 1, 1)
        val tree8 = Tree.fromString("(()())")

        assertArrayEquals(parents8, TopologyAnalyser.buildParentsArrayFromTouchGraph(g8, 1))
        assertEquals(tree8.toString(), TopologyAnalyser.buildTreeFromParentsArray(parents8, 1).toString())
    }

    @Test
    fun test15() {
        val g15 = Graph(10)
        g15.addEdge(0, 1)
        g15.addEdge(1, 2)
        g15.addEdge(1, 3)
        g15.addEdge(2, 3)
        g15.addEdge(3, 4)
        g15.addEdge(4, 5)
        g15.addEdge(5, 6)
        g15.addEdge(5, 7)
        g15.addEdge(7, 8)
        g15.addEdge(7, 9)
        val parents15 = arrayOf(0, 0, 1, 1, 3, 4, 5, 5, 7, 7 )
        val tree15 = Tree.fromString("((()(((()(()()))))))")

        assertArrayEquals(parents15, TopologyAnalyser.buildParentsArrayFromTouchGraph(g15, 0))
        assertEquals(tree15.toString(), TopologyAnalyser.buildTreeFromParentsArray(parents15, 0).toString())
    }
}
