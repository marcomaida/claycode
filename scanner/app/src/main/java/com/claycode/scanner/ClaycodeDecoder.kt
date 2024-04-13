package com.claycode.scanner

import android.graphics.Bitmap

class ClaycodeDecoder {
    companion object {
        init {
            System.loadLibrary("topology-extractor")
        }

        private external fun stringFromJNI(): String

        fun decode(bitmap: Bitmap) : String {
            return stringFromJNI()
        }
    }
}