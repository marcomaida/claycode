package com.claycode.scanner

import android.graphics.Bitmap
import android.util.Log
import com.claycode.scanner.data_structures.Graph
import com.claycode.scanner.topology_analysis.ClaycodeFinder
import com.claycode.scanner.topology_analysis.TopologyAnalyser
import com.claycode.scanner.topology_decoder.BitTreeConverter
import com.claycode.scanner.topology_decoder.BitsValidator
import com.claycode.scanner.topology_decoder.TextBitsConverter

class ClaycodeDecoder {
    companion object {
        init {
            System.loadLibrary("topology-extractor")
        }

        public external fun extractTouchGraph(bitmap: Bitmap, left: Int, top: Int, width: Int, height: Int): Array<IntArray>

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

            Log.i("Performance", "-----------------")
            val startTime = System.currentTimeMillis()
            logRelativeTime("Start Decode Process (${bitmap.width}x${bitmap.height})", startTime);
            val touchGraph = Graph.fromArrayOfIntArray(extractTouchGraph(bitmap, left, top, squareSize, squareSize))
            logRelativeTime("Topology Extractor C++", startTime);
            val parents = TopologyAnalyser.buildParentsArrayFromTouchGraph(touchGraph, 0)
            logRelativeTime("Build Parents Array", startTime);
            val topologyTree = TopologyAnalyser.buildTreeFromParentsArray(parents, 0)
            logRelativeTime("Build Tree", startTime);
            val potentialClaycodeTrees = ClaycodeFinder.findPotentialClaycodeRoots(topologyTree)
            logRelativeTime("Find Potential Claycodes", startTime);

            var results: Array<String> = emptyArray()
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

            return Triple(potentialClaycodeTrees.size,results.size, out)
        }
    }
}