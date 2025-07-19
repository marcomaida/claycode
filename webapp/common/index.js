/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

// Tree components
export { Tree, treeIterator } from './tree/tree.js';
export { TreeNode } from './tree/tree_node.js';
export { TopologyAnalyzer } from './tree/topology_analyzer.js';

// Bit components
export { BitString } from './bits/bit_string.js';
export { BitTreeConverter } from './bits/bit_tree_converter.js';
export { BitsValidator } from './bits/bits_validator.js';
export { TextBitsConverter } from './bits/text_bits_converter.js';

// Utility components
export { FpsCounter } from './utils/fps_counter.js';

/**
 * Claycode Common Library
 * 
 * This library provides common functionality for both the scanner and generator
 * components of the Claycode webapp. It includes:
 * 
 * - Tree data structures and operations
 * - Bit manipulation and conversion utilities
 * - Text-to-bits and bits-to-text conversion
 * - CRC validation
 * - Performance monitoring utilities
 */