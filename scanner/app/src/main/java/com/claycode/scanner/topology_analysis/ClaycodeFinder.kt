/*
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

package com.claycode.scanner.topology_analysis

import com.claycode.scanner.data_structures.Tree

/**
 * Finds potential Claycode in a given topology tree.
 */
class ClaycodeFinder {
    companion object {
        /**
         *  We can identify potential Claycodes by either looking for *towers* or for nodes with at least N descendants.
         *
         *  Tower approach:
         *  The outer white may mix with some part of the background, resulting in a shape with multiple children.
         *  Therefore, we do not account for it.
         *  The tower height represents for how many consecutive generations nodes have been only-children.
         *  A node that has siblings has a tower-height of zero.
         *  If a node has tower-height `h`, and it has only one child, that child has tower height `h+1`.
         *
         *  Descendants approach:
         *  This approach is more straightforward and can lead to more false positives. We simply return all nodes with
         *  at least N descendants. The idea stems from the fact that random images do not lead to complex topologies.
         */

        // The tower-height of Claycode roots. Depends on the Claycode's frame.
        val CLAYCODE_ROOT_TOWER_HEIGHT = 3
        // The minimum number of descendants necessary for a node to be considered a potential Claycode root.
        val CLAYCODE_ROOT_MIN_DESCENDANTS = 10
        fun findPotentialClaycodeRoots(topologyTree: Tree) : List<Tree> {
            // return findAllNodesWithTowerHeightGreaterThan(topologyTree, CLAYCODE_ROOT_TOWER_HEIGHT)
            return findNodesWithAtLeastNDescendants(topologyTree, CLAYCODE_ROOT_MIN_DESCENDANTS)
        }

        /**
         * Given a tree and a target number of nodes N, finds all the
         * nodes with at least N descendants.
         * A leaf has 1 descendant, which is itself.
         */
        fun findNodesWithAtLeastNDescendants(root: Tree, N: Int): List<Tree> {
            val result = mutableListOf<Tree>()

            // Helper function to count descendants
            fun countDescendants(node: Tree): Int {
                var count = 1
                for (child in node.children) {
                    count += countDescendants(child)
                }

                if (count >= N) {
                    result.add(node)
                }
                return count
            }

            countDescendants(root)
            return result
        }

        /**
         * Given a tree and a target tower height, returns all the
         * nodes in the tree that have at least the given tower height.
         */
        fun findAllNodesWithTowerHeightGreaterThan(treeRoot: Tree, targetTowerHeight: Int) : List<Tree> {
            val result : MutableList<Tree> = mutableListOf()

            // We execute an iterative BFS,
            // Keeping track of the current tower-height
            val stack = mutableListOf(Pair(treeRoot, 0))
            while (stack.isNotEmpty()) {
                val (currentNode, currentTowerHeight) = stack.removeAt(0)

                // Process the current node
                if (currentTowerHeight >= targetTowerHeight) {
                    result.add(currentNode)
                }

                val hasOnlyOneChild = currentNode.children.size == 1
                val nextTowerHeight = if (hasOnlyOneChild) currentTowerHeight + 1 else 0
                for (childNode in currentNode.children) {
                    stack.add(Pair(childNode, nextTowerHeight))
                }
            }

            return result
        }

    }
}