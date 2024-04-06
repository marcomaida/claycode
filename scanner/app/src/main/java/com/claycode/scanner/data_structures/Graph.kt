package com.claycode.scanner.data_structures

/**
 * An undirected graph that uses an adjacency list representation,
 * where nodes are numbered from 0 to n.
 */
public class Graph(n: Int) {
    private val adjList: Array<HashSet<Int>> = Array(n) { hashSetOf<Int>() }

    fun addEdge(a: Int, b: Int) {
        if (a < 0 || b < 0 || a >= adjList.size || b >= adjList.size)
            throw IllegalArgumentException("Node number does not exist")

        adjList[a].add(b)
        adjList[b].add(a)
    }

    fun getAdjacentVertices(a: Int): Set<Int> {
        if (a < 0 || a >= adjList.size)
            throw IllegalArgumentException("Node number does not exist")

        return adjList[a]
    }

    override fun toString() : String {
        var s = ""
        adjList.forEachIndexed { index, edges ->
            s += "$index: [${edges.joinToString(", ")}] ";
        }

        return s
    }
}
