package com.claycode.scanner

import android.graphics.Bitmap

class ClaycodeDecoder {
    companion object {
        fun decode(bitmap: Bitmap) : String {
            return bitmap.hashCode().toString()
        }
    }
}