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

        public external fun extractTouchGraph(bitmap: Bitmap): Array<IntArray>

        fun logRelativeTime(tag: String, startTime: Long) {
            val delta = System.currentTimeMillis() - startTime
            Log.i("Performance", "${tag}:${delta}")
        }

        fun decode(bitmap: Bitmap): Triple<Int,Int,String> {
            val startTime = System.currentTimeMillis()
            logRelativeTime("Start Decode Process", startTime);
            val touchGraph = Graph.fromArrayOfIntArray(extractTouchGraph(bitmap))
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