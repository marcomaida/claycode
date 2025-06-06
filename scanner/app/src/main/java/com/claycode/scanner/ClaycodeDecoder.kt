package com.claycode.scanner

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import com.claycode.scanner.data_structures.BitString
import com.claycode.scanner.data_structures.Graph
import com.claycode.scanner.data_structures.Tree
import com.claycode.scanner.topology_analysis.ClaycodeFinder
import com.claycode.scanner.topology_analysis.TopologyAnalyser
import com.claycode.scanner.topology_decoder.BitTreeConverter
import com.claycode.scanner.topology_decoder.BitsValidator
import com.claycode.scanner.topology_decoder.TextBitsConverter
import java.io.File
import java.io.IOException
import kotlin.time.Duration.Companion.seconds

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
const val USE_PRIVATE_DOMAIN = false
const val USE_FRAGMENTS = false
const val PERFORMANCE_LOGS = false
const val TREE_LOG = false
const val SUCCESSFUL_SCAN_TIME_LOG = false

class ClaycodeDecoder {
    companion object {
        init {
            System.loadLibrary("topology-extractor")
        }

        public external fun extractTouchGraph(bitmap: Bitmap, left: Int, top: Int, width: Int, height: Int): Array<IntArray>
        public external fun extractParentsArray(bitmap: Bitmap, left: Int, top: Int, width: Int, height: Int): IntArray

        fun logLongMessage(tag: String, message: String) {
            val maxLogSize = 3000 // Conservative. Hard max is around 4k
            var startIndex = 0
            while (startIndex < message.length) {
                val endIndex = (startIndex + maxLogSize).coerceAtMost(message.length)
                Log.i(tag, message.substring(startIndex, endIndex))
                startIndex = endIndex
            }
            Log.i(tag, "END-LONG-LOG")
        }

        fun logRelativeTime(tag: String, startTime: Long) {
            val delta = System.currentTimeMillis() - startTime
            if (PERFORMANCE_LOGS) {
                Log.i("ClaycodePerformance", "${tag}:${delta}")
            }
        }

        fun decode(context: Context, bitmap: Bitmap, square_size_pct: Float): Triple<Int,Int,String> {
            // Calculate the centered square box size and position
            val squareSize = (square_size_pct * minOf(
                bitmap.width,
                bitmap.height
            )).toInt()
            val left = (bitmap.width - squareSize) / 2
            val top = (bitmap.height - squareSize) / 2

            if (PERFORMANCE_LOGS) {
                Log.i("ClaycodePerformance", "---------------------")
            }
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

//             Log longest potential Claycode
//             val longest = potentialClaycodeTrees.maxByOrNull { it.toString().length }
//             if(longest != null) {
//                logLongMessage("CandidateTree", longest.toString())
//             }

            if(TREE_LOG && topologyTree != null) {
                logLongMessage("Tree", topologyTree.toString())
            }

            var results: Array<String> = emptyArray()

            // 1 - Check for the private domain
            if (USE_PRIVATE_DOMAIN) {
                for (tree in potentialClaycodeTrees) {
                    when (tree.toString()) {
                        // NOTE: This is not the correct way to do it -- this is temporary.
                        // We should check for equivalence in a way that's not dependent on the tree ordering
                        "((())()()()()()()(()()()())(()))" -> {
                            results += "Woof \uD83D\uDC36"
                        }
                        "((()()())()()()()()()()()()()()()()()()()()()()()()()())" -> {
                            results += "\uD83C\uDFB5 I am not just a Spotify Code... \uD83C\uDFB5"
                        }
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

            if (SUCCESSFUL_SCAN_TIME_LOG && results.isNotEmpty()) {
                val delta = System.currentTimeMillis() - startTime
                Log.i("ClaycodeSuccessfulScan", "${delta}:${results[0]}")

                val logEntry = "${delta}:${results[0]}\n"
                val fileName = "claycode_successful_scans.txt"
                val file = File(context.getExternalFilesDir(null), fileName)
                try {
                    file.appendText(logEntry)
                } catch (e: IOException) {
                    Log.e("ClaycodeLogging", "Failed to write log", e)
                }

                Thread.sleep(500)

                // Short-circuit to avoid user popups upon successful scan
                return Triple(potentialClaycodeTrees.size, 0, "")
            }

            // 3 - Check for matching fragments
            // NOTE: We use the tree-to-bits function as a temporary replacement for unordered tree equality
            if (USE_FRAGMENTS && results.isEmpty()) {
                val countMap: HashMap<BitString, Pair<Int, Tree>> = HashMap()
                for (tree in potentialClaycodeTrees) {
                    val bits = BitTreeConverter.treeToBits(tree)
                    countMap[bits] =
                        Pair(countMap.getOrDefault(bits, Pair(0, tree)).first + 1, tree)
                }

                // Find all results that have at least two matching fragments
                val potentialResults = mutableListOf<Triple<Int, Tree, BitString>>()
                for ((bits, pair) in countMap) {
                    val (count, tree) = pair
                    if (count >= 2 && tree.children.size==1) { // NOTE: only keeping the 2-towers
                        potentialResults.add(Triple(count, tree, bits))
                    }
                }

                // From all the results, take the biggest tree (we might be matching also the subtree)
                // Note: we compute the tree length in a sketchy way, using `toString`
                if (potentialResults.isNotEmpty()) {
                    var longestResult = potentialResults[0]
                    var longestResultTreeSize = 0
                    for (res in potentialResults) {
                        val treeSize = res.second.toString().length/2
                        if (treeSize >= longestResultTreeSize) {
                            longestResult = res
                            longestResultTreeSize = treeSize
                        }
                    }

                    // Final check: only accept the tree has more than 20 Nodes.
                    // TODO: This can be greatly refactored
                    if (longestResultTreeSize > 20) {
                        val (numFragments, _, bits) = longestResult;
                        Log.i("CC2.0", bits.toString())

                        // Match database, otherwise print generic metadata
                        results += when(bits) {
                            BitString("00001011011011010100101010111110100001001000001") -> "https://www.facebook.com/sharartegrafica.it/"
                            BitString("000011001001100001110000001000011100111111010001100001001111100000000010010001011001101001000100010101100101") -> "https://www.instagram.com/shara.arte.grafica"
                            else -> "[CC 2.0] $numFragments Fragments, ${longestResultTreeSize - 2} Nodes"
                        }

                    }
                }
            }

            var out = ""
            for (r in results) {
                out += "$r "
            }

            return Triple(potentialClaycodeTrees.size, results.size, out)
        }
    }
}
