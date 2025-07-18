/*
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

package com.claycode.scanner.data_structures

public class Tree(var children: MutableList<Tree> = mutableListOf()) {
    fun addChild(child: Tree) {
        // We remove this assertion as it massively slows down the code
        // assert(!children.contains(child)) { "Tree was added as child twice" }

        children += child
    }

    /**
     * Create a tree object from a string definition in the form "(()(()))".
     * The string must be non-empty and well-formed.
     */
    companion object {
        fun fromString(s: String): Tree {
            if (s.isEmpty())  { throw IllegalArgumentException("String is ill-formed") }

            val stack = mutableListOf<Tree>()
            var currentTree = Tree()

            for (char in s) {
                when (char) {
                    '(' -> {
                        stack.add(currentTree)
                        currentTree = Tree()
                    }
                    ')' -> {
                        val finishedTree = currentTree
                        if (stack.isEmpty()) { throw IllegalArgumentException("String is ill-formed") }
                        currentTree = stack.removeAt(stack.lastIndex)
                        currentTree.children += finishedTree
                    }
                }
            }

            if (stack.isNotEmpty() || currentTree.children.size > 1) {
                // When we get to this block, we must have exhausted the string,
                // and the initial root must have exactly one child.
                throw IllegalArgumentException("String is ill-formed")
            }

            // The approach above creates an extra node, to be removed at the end.
            return currentTree.children[0]
        }
    }

    /**
     * Returns the braces representation of the tree. It is the inverse of `fromString`
     */
    override fun toString(): String {
        return if (children.isEmpty()) "()"
        else children.joinToString(
                separator = "",
                prefix = "(",
                postfix = ")"
            ) { it.toString() }
    }
}
