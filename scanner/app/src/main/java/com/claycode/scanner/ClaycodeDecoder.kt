package com.claycode.scanner

import android.graphics.Bitmap
import android.util.Log
import com.claycode.scanner.data_structures.Graph
import com.claycode.scanner.topology_analysis.ClaycodeFinder
import com.claycode.scanner.topology_analysis.TopologyAnalyser
import com.claycode.scanner.topology_decoder.BitTreeConverter
import com.claycode.scanner.topology_decoder.BitsValidator
import com.claycode.scanner.topology_decoder.TextBitsConverter

enum class DecodingStack {
    /**
     * This stack uses OpenCV to prepare the image, then a proprietary algorithm
     * to build a touch graph, and then the erosion algorithm to build the parents array
     */
    PROPRIETARY_EROSION,
    /**
     * This stack uses OpenCV to prepare the image and to build the parents array,
     * using the `findCountours` function.
     */
    OPEN_CV_CONTOURS
}

val DECODING_STACK: DecodingStack = DecodingStack.OPEN_CV_CONTOURS

class ClaycodeDecoder {
    companion object {
        init {
            System.loadLibrary("topology-extractor")
        }

        public external fun extractTouchGraph(bitmap: Bitmap, left: Int, top: Int, width: Int, height: Int): Array<IntArray>
        public external fun extractParentsArray(bitmap: Bitmap, left: Int, top: Int, width: Int, height: Int): IntArray

        fun logRelativeTime(tag: String, startTime: Long) {
            val delta = System.currentTimeMillis() - startTime
            Log.i("Performance", "${tag}:${delta}")
        }

        fun decode(bitmap: Bitmap, square_size_pct: Float): Triple<Int,Int,String> {
            // Calculate the centered square box size and position
            val squareSize = (square_size_pct * minOf(
                bitmap.width,
                bitmap.height
            )).toInt()
            val left = (bitmap.width - squareSize) / 2
            val top = (bitmap.height - squareSize) / 2

            Log.i("Performance", "---------------------")
            val startTime = System.currentTimeMillis()
            logRelativeTime("Start Decode Process (${bitmap.width}x${bitmap.height}, $DECODING_STACK)", startTime);
            val parents = when (DECODING_STACK) {
                DecodingStack.PROPRIETARY_EROSION -> {
                    val touchGraph = Graph.fromArrayOfIntArray(extractTouchGraph(bitmap, left, top, squareSize, squareSize))
                    logRelativeTime("Topology Extractor C++", startTime);
                    TopologyAnalyser.buildParentsArrayFromTouchGraph(touchGraph, 0)
                }
                DecodingStack.OPEN_CV_CONTOURS -> {
                    extractParentsArray(bitmap, left, top, squareSize, squareSize).toTypedArray()
                }
            }
            logRelativeTime("Build Parents Array", startTime);
            val topologyTree = TopologyAnalyser.buildTreeFromParentsArray(parents, 0)
            logRelativeTime("Build Tree", startTime);
            val potentialClaycodeTrees = ClaycodeFinder.findPotentialClaycodeRoots(topologyTree)
            logRelativeTime("Find Potential Claycodes", startTime);

            // Log longest potential Claycode
            val longest = potentialClaycodeTrees.maxByOrNull { it.toString().length }
            if(longest != null) {
                Log.i("Trees", longest.toString())
            }

            var results: Array<String> = emptyArray()

            // 1 - Check for the private domain
            for (tree in potentialClaycodeTrees) {
                when (tree.toString()) {
                    // NOTE: This is not the correct way to do it -- this is temporary.
                    // We should check for equivalence in a way that's not dependent on the tree ordering
                    "((((((())()()()()()()(()()()())(()))))))" -> {
                        results += "Woof \uD83D\uDC36"
                    }
                    "((((()()())()()()()()()()()()()()()()()()()()()()()()()())))" -> {
                        results += "\uD83C\uDFB5 I am not just a Spotify Code... \uD83C\uDFB5"
                    }
                }
            }

            // 2 - Check for the public domain
            for (tree in potentialClaycodeTrees) {
                val bits = BitTreeConverter.treeToBits(tree)
                val decoded = BitsValidator.getValidatedBitString(bits)
                if (decoded != null) {
                    val decodedText = TextBitsConverter.bitsToText(decoded)
                    results += decodedText
                }
            }
            logRelativeTime("Bit to Text", startTime);

            var out = ""
            for (r in results) {
                out += "$r "
            }

            return Triple(potentialClaycodeTrees.size, results.size, out)
        }
    }
}