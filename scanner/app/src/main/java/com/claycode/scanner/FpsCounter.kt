/*
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

package com.claycode.scanner

import java.util.ArrayDeque

class FpsCounter(private val maxSamples : Int) {
    private var ringBuffer = ArrayDeque<Long>()
    private var runningSum = 0.0
    private var lastTimestamp : Long? = null

    public fun addSample(timestampMs: Long) : Double {
        if (lastTimestamp == null)
        {
            lastTimestamp = timestampMs
            return 0.0;
        }

        val elapsedSinceLastSampleMs = timestampMs - lastTimestamp!!
        runningSum += elapsedSinceLastSampleMs
        ringBuffer.addFirst(elapsedSinceLastSampleMs)
        if (ringBuffer.size == maxSamples)
        {
            runningSum -= ringBuffer.removeLast()
        }

        lastTimestamp = timestampMs
        val avg = runningSum/ringBuffer.size
        return 1/(avg/1000)
    }

    public fun resetLastSample(timestampMs: Long)
    {
        lastTimestamp = timestampMs
    }
}