package com.claycode.scanner

import android.graphics.Bitmap

class ClaycodeDecoder {
    companion object {
        init {
            System.loadLibrary("topology-extractor")
        }

        private external fun extractTouchGraph(bitmap: Bitmap): Array<IntArray>

        fun decode(bitmap: Bitmap) : String {
            val data = extractTouchGraph(bitmap)
            val dimensions = data[0]
            val means = data[1]
            return "size : ${dimensions[0]}x${dimensions[1]}, mean rgb: {${means[0]}, ${means[1]}, ${means[2]}}"
        }
    }
}