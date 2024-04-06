package com.claycode.scanner

import com.claycode.scanner.data_structures.Graph
import org.junit.Assert.*
import org.junit.Test

class GraphUnitTest {
    @Test
    fun graph_basic() {
        val g = Graph(3)

        // Graph starts out empty
        for (i in 0..2) assertTrue(g.getAdjacentVertices(i).isEmpty())

        g.addEdge(0,1)

        assertEquals(g.getAdjacentVertices(0), HashSet(listOf(1)))
        assertEquals(g.getAdjacentVertices(1), HashSet(listOf(0)))
        assertTrue(g.getAdjacentVertices(2).isEmpty())
    }

    @Test
    fun graph_noDuplicateEdges() {
        val graph = Graph(2)

        graph.addEdge(0, 1)
        graph.addEdge(0, 1) // Attempt to add a duplicate edge
        graph.addEdge(1, 0) // Opposite assignment

        assertEquals(1, graph.getAdjacentVertices(0).size)
    }

    @Test
    fun graph_outOfBounds() {
        val graph = Graph(2)

        assertThrows(IllegalArgumentException::class.java) { graph.addEdge(-1, 5) }
        assertThrows(IllegalArgumentException::class.java) { graph.addEdge(-1, 1) }
        assertThrows(IllegalArgumentException::class.java) { graph.addEdge(1, -1) }
        assertThrows(IllegalArgumentException::class.java) { graph.addEdge(0, 2) }
        assertThrows(IllegalArgumentException::class.java) { graph.addEdge(2, 0) }
        assertThrows(IllegalArgumentException::class.java) { graph.addEdge(3, 1) }

        assertThrows(IllegalArgumentException::class.java) { graph.getAdjacentVertices(-1) }
        assertThrows(IllegalArgumentException::class.java) { graph.getAdjacentVertices(2) }
        assertThrows(IllegalArgumentException::class.java) { graph.getAdjacentVertices(3) }
    }
}