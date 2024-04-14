package com.claycode.scanner.topology_analysis

import com.claycode.scanner.data_structures.Tree

/**
 * Finds potential Claycode in a given topology tree.
 */
class ClaycodeFinder {
    companion object {
        /**
         *  The outer white may mix with some part of the background,
         *  resulting in a shape with multiple children.
         *  Therefore, we do not account for it.
         *
         *  The tower height represents for how many consecutive generations nodes have been only-children.
         *  A node that has siblings has a tower-height of zero.
         *  If a node has tower-height `h`, and it has only one child, that child has tower height `h+1`.
         */

        // The tower-height of Claycode roots. Depends on the Claycode's frame.
        val CLAYCODE_ROOT_TOWER_HEIGHT = 3
        fun findPotentialClaycodeRoots(topologyTree: Tree) : List<Tree> {
            return findAllNodesWithTowerHeightGreaterThan(topologyTree, CLAYCODE_ROOT_TOWER_HEIGHT)
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