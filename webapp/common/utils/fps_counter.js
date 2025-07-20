/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

/**
 * Common FpsCounter class used by both scanner and generator
 */
export class FpsCounter {
    constructor(maxSamples) {
        this.maxSamples = maxSamples;
        this.samples = [];
        this.lastTime = 0;
    }

    addSample(currentTime) {
        if (this.lastTime > 0) {
            const delta = currentTime - this.lastTime;
            if (delta > 0) {
                const fps = 1000 / delta;
                this.samples.push(fps);

                if (this.samples.length > this.maxSamples) {
                    this.samples.shift();
                }
            }
        }

        this.lastTime = currentTime;

        if (this.samples.length === 0) return 0;

        const sum = this.samples.reduce((a, b) => a + b, 0);
        return sum / this.samples.length;
    }
}