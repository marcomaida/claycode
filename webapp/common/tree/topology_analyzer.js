/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import { TreeNode } from "./tree_node.js";

/**
 * Common TopologyAnalyzer class used by both scanner and generator
 */
export class TopologyAnalyzer {
    static buildTreeFromParentsArray(parents, rootIndex) {
        if (!parents || parents.length === 0) return null;
        
        const nodes = new Map();
        
        // Create all nodes
        for (let i = 0; i < parents.length; i++) {
            nodes.set(i, new TreeNode(null, []));
            nodes.get(i).id = i;
        }
        
        // Build parent-child relationships
        for (let i = 0; i < parents.length; i++) {
            const parentIndex = parents[i];
            if (parentIndex >= 0 && parentIndex !== i && nodes.has(parentIndex)) {
                const parent = nodes.get(parentIndex);
                const child = nodes.get(i);
                parent.addChild(child);
                child.father = parent;
            }
        }
        
        return nodes.get(rootIndex) || null;
    }
    
    static findPotentialClaycodeRoots(tree) {
        if (!tree) return [];
        
        const potentialRoots = [];
        this.traverseTree(tree, (node) => {
            if (this.isPotentialClaycode(node)) {
                potentialRoots.push(node);
            }
        });
        
        return potentialRoots;
    }
    
    static isPotentialClaycode(node) {
        if (!node) return false;
        const totalNodes = this.countNodes(node);
        return totalNodes >= 3 && totalNodes <= 1000;
    }
    
    static countNodes(node) {
        if (!node) return 0;
        let count = 1;
        for (const child of node.children) {
            count += this.countNodes(child);
        }
        return count;
    }
    
    static traverseTree(node, callback) {
        if (!node) return;
        callback(node);
        for (const child of node.children) {
            this.traverseTree(child, callback);
        }
    }
}