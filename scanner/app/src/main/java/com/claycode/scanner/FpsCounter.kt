/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

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