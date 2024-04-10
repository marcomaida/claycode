package com.claycode.scanner

import android.graphics.Bitmap

class ClaycodeDecoder {
    companion object {
        init {
            System.loadLibrary("image-processor")
        }

        private external fun stringFromJNI(): String

        fun decode(bitmap: Bitmap) : String {
            return stringFromJNI()
        }
    }
}