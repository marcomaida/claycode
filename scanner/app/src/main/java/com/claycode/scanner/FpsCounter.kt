package com.claycode.scanner

import java.util.ArrayDeque

class FpsCounter(private val maxSamples : Int) {
    private var ringBuffer = ArrayDeque<Long>()
    private var runningSum = 0.0

    public fun addSample(elapsedTimeMs: Long) : Double {
        runningSum += elapsedTimeMs
        ringBuffer.addFirst(elapsedTimeMs)
        if (ringBuffer.size == maxSamples)
        {
            runningSum -= ringBuffer.removeLast()
        }

        val avg = runningSum/ringBuffer.size
        return 1/(avg/1000)
    }
}