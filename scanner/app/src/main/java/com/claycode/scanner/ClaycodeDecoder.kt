package com.claycode.scanner

import android.graphics.Bitmap
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

        fun decode(bitmap: Bitmap): Triple<Int,Int,String> {
            val touchGraph = Graph.fromArrayOfIntArray(extractTouchGraph(bitmap))
            val parents = TopologyAnalyser.buildParentsArrayFromTouchGraph(touchGraph, 0)
            val topologyTree = TopologyAnalyser.buildTreeFromParentsArray(parents, 0)
            val potentialClaycodeTrees = ClaycodeFinder.findPotentialClaycodeRoots(topologyTree)


            var results: Array<String> = emptyArray()
            for (tree in potentialClaycodeTrees) {
                val bits = BitTreeConverter.treeToBits(tree)
                val decoded = BitsValidator.getValidatedBitString(bits)
                if (decoded != null) {
                    val decodedText = TextBitsConverter.bitsToText(decoded)
                    results += decodedText
                }
            }

            var out = ""
            for (r in results) {
                out += "$r "
            }

            return Triple(potentialClaycodeTrees.size,results.size, out)
        }
    }
}