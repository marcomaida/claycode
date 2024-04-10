package com.claycode.scanner.topology_analysis

import com.claycode.scanner.data_structures.Graph
import com.claycode.scanner.data_structures.Tree

class TopologyAnalyser {

    companion object {
        /**
         * "EROSION" Algorithm.
         * Given a touch graph and the border shape,
         * returns the inferred parent of each shape
         */
        fun buildParentsArrayFromTouchGraph(
            touchGraph: Graph,
            borderClass: Int
        ): Array<Int> {
            val parents: Array<Int> = Array(touchGraph.size) { -1 }
            parents[borderClass] = borderClass

            // Given the parent shape, find all the direct children, and recursively calls itself
            fun findParentsRecursive(s0: Int) {
                assert(parents[s0] != -1) { "Parent was not processed before recursive call" }
                val unexploredNodesTouchingS0 = touchGraph[s0].filter { parents[it] == -1 }
                if (unexploredNodesTouchingS0.isEmpty()) {
                    return /* Found a leaf */
                }

                val nodesOnLevel = unexploredNodesTouchingS0.toMutableList()
                // Get the touch count for each node in the touch graph
                val touchCount = Array(touchGraph.size) { 0 }
                nodesOnLevel.forEach { n ->
                    touchGraph[n].forEach { nn ->
                        touchCount[nn]++
                    }
                }

                while (true) {
                    // Of all the nodes, get only the ones with at least two touches
                    // that are not already explored
                    val newNodes = touchCount.withIndex().filter {
                        it.value >= 2 && it.index !in nodesOnLevel && it.index != s0
                    }.map { it.index }

                    // If no new nodes are found, we reached a fix-point.
                    if (newNodes.isEmpty()) break
                    nodesOnLevel += newNodes

                    // Add the new nodes to the touch count
                    newNodes.forEach { n ->
                        touchGraph[n].forEach { nn ->
                            touchCount[nn]++
                        }
                    }
                }

                // Assign parent to all siblings
                nodesOnLevel.forEach { n -> parents[n] = s0 }

                // Recursively explore nodes. Must be done AFTER assigning levels.
                nodesOnLevel.forEach { n -> findParentsRecursive(n) }
            }

            findParentsRecursive(borderClass)

            // All parents must be assigned
            assert(parents.none { it == -1 }) { "Not all parents were assigned!" }

            return parents
        }


        /**
         * Takes in input the parents array, and returns a tree.
         * Does NOT guarantee the absence of cycles.
         */
        fun buildTreeFromParentsArray(parents:Array<Int>, root: Int) : Tree {
            val nodeMap = mutableMapOf<Int, Tree>()

            // Initialize Tree objects for each node
            for (i in parents.indices) {
                nodeMap[i] = Tree()
            }

            // Build the tree by setting children
            for ((childIndex, parentIndex) in parents.withIndex()) {
                if (childIndex != root) { // Skip the root since it has no parent
                    nodeMap[parentIndex]!!.addChild(nodeMap[childIndex]!!)
                }
            }

            // Return the root of the tree
            return nodeMap[root]!!
        }
    }
}