/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

class TopologyAnalyzer {
    static buildTreeFromParentsArray(parents, rootIndex) {
        if (!parents || parents.length === 0) return null;
        
        const nodes = new Map();
        
        // Create all nodes
        for (let i = 0; i < parents.length; i++) {
            nodes.set(i, new TreeNode(i));
        }
        
        // Build parent-child relationships
        for (let i = 0; i < parents.length; i++) {
            const parentIndex = parents[i];
            if (parentIndex >= 0 && parentIndex !== i && nodes.has(parentIndex)) {
                const parent = nodes.get(parentIndex);
                const child = nodes.get(i);
                parent.addChild(child);
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

class TreeNode {
    constructor(id) {
        this.id = id;
        this.children = [];
    }
    
    addChild(child) {
        if (child && !this.children.includes(child)) {
            this.children.push(child);
        }
    }
    
    toString() {
        if (this.children.length === 0) return "()";
        const childStrings = this.children.map(child => child.toString());
        return "(" + childStrings.join("") + ")";
    }
}

class BitTreeConverter {
    static treeToBits(tree) {
        if (!tree) return new BitString("");
        
        const number = this.treeToNumber(tree);
        return this.numberToBitString(number);
    }
    
    static treeToNumber(tree) {
        if (!tree.children || tree.children.length === 0) {
            return 1n;
        }
        
        const childNumbers = tree.children.map(child => this.treeToNumber(child));
        return this.squareDecompositionToNumber(childNumbers);
    }
    
    static squareDecompositionToNumber(decomposition) {
        let sum = 0n;
        for (const num of decomposition) {
            sum += num * num;
        }
        return sum + 1n;
    }
    
    static numberToBitString(number) {
        const binaryStr = number.toString(2);
        return new BitString(binaryStr.substring(1));
    }
}

class BitString {
    constructor(bitString) {
        this.bits = bitString;
    }
    
    get length() {
        return this.bits.length;
    }
    
    toString() {
        return this.bits;
    }
    
    slice(start, end) {
        return new BitString(this.bits.slice(start, end));
    }
    
    equals(other) {
        return other instanceof BitString && this.bits === other.bits;
    }
}

class BitsValidator {
    static CRC_POLY = new BitString("10100010110011001");
    
    static getValidatedBitString(bits, polynomialBits = this.CRC_POLY) {
        if (!bits || bits.length < polynomialBits.length) {
            return null;
        }
        
        const bitsWithoutCRC = bits.slice(0, bits.length - polynomialBits.length + 1);
        const crc = bits.slice(bits.length - polynomialBits.length + 1);
        
        const computedCRC = this.computeCRC(bitsWithoutCRC, polynomialBits);
        
        if (crc.toString() !== computedCRC.toString()) {
            return null;
        }
        
        return bitsWithoutCRC;
    }
    
    static computeCRC(inputBits, polynomialBits) {
        const input = inputBits.toString().split('').map(b => parseInt(b));
        const polynomial = polynomialBits.toString().split('').map(b => parseInt(b));
        
        // Append zeros
        for (let i = 0; i < polynomial.length - 1; i++) {
            input.push(0);
        }
        
        // Process bits
        for (let i = 0; i <= input.length - polynomial.length; i++) {
            if (input[i] === 1) {
                for (let j = 0; j < polynomial.length; j++) {
                    input[i + j] ^= polynomial[j];
                }
            }
        }
        
        // Extract CRC
        const crc = input.slice(input.length - polynomial.length + 1);
        return new BitString(crc.join(''));
    }
}

class TextBitsConverter {
    static bitsToText(bits) {
        if (!bits) return "";
        
        const bitString = bits.toString();
        
        try {
            // Split into 8-bit chunks and convert to bytes
            const chunks = bitString.match(/.{1,8}/g) || [];
            const bytes = [];
            
            for (const chunk of chunks) {
                if (chunk.length === 8) {
                    bytes.push(parseInt(chunk, 2));
                }
            }
            
            // Convert bytes to UTF-8 string
            const decoder = new TextDecoder('utf-8');
            const uint8Array = new Uint8Array(bytes);
            return decoder.decode(uint8Array);
        } catch (e) {
            return `[Claycode] ${bitString.length} bits`;
        }
    }
}