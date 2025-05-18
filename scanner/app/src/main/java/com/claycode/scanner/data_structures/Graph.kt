/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

package com.claycode.scanner.data_structures

/**
 * An undirected graph that uses an adjacency list representation,
 * where nodes are numbered from 0 to n.
 */
public class Graph(var size: Int) {
    private val adjList: Array<HashSet<Int>> = Array(size) { hashSetOf<Int>() }

    companion object {
        fun fromArrayOfIntArray(inputGraph: Array<IntArray>) : Graph {
            val g = Graph(inputGraph.size)
            for (n1 in inputGraph.indices) {
                for (n2 in inputGraph[n1]) {
                    g.addEdge(n1,n2)
                }
            }

            return g
        }
    }

    operator fun get(index: Int): HashSet<Int> = adjList[index]

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
        var s = "["
        adjList.forEachIndexed { index, edges ->
            s += "$index: [${edges.joinToString(", ")}] ";
        }
        return s.trim() + "]";
    }
}
