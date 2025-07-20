/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

/**
 * Common BitString class used by both scanner and generator
 */
export class BitString {
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