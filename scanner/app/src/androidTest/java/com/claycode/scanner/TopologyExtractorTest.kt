package com.claycode.scanner

import android.graphics.Bitmap
import android.graphics.Color
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.claycode.scanner.data_structures.Graph
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Instrumented test, which will execute on an Android device.
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
@RunWith(AndroidJUnit4::class)
class TopologyExtractorTest {
    /*
     * Helper function to simulate a camera input
     * The input list's string must be of the same size
     * It must contain only y (yellow), r (red) b (black), or w (white)
     */
    fun createColorMatrixBitmap(colorRows: List<String>): Bitmap {
        if (colorRows.isEmpty() || colorRows.any { it.length != colorRows[0].length }) {
            throw IllegalArgumentException("All rows must have the same length.")
        }

        val height = colorRows.size
        val width = colorRows[0].length
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        for (y in colorRows.indices) {
            for (x in colorRows[y].indices) {
                val color = when (colorRows[y][x]) {
                    'y' -> Color.YELLOW
                    'r' -> Color.RED
                    'b' -> Color.BLACK
                    'w' -> Color.WHITE
                    else -> throw IllegalArgumentException("Invalid color character: ${colorRows[y][x]}. Use 'r', 'g', or 'b'.")
                }
                bitmap.setPixel(x, y, color)
            }
        }

        return bitmap
    }

    /**
     * NOTE: These synthetic images must have thick shapes,
     * so that they can survive the OpenCV filters.
     */

    @Test
    fun extractTouchGraph_twoShapes() {
        val img = createColorMatrixBitmap(listOf(
                "wwwwbbbb",
                "wwwwbbbb",
                "wwwwbbbb"
        ))
        val touchGraph = Graph.fromArrayOfIntArray(ClaycodeDecoder.extractTouchGraph(img, 0, 0, img.width, img.height));

        assertEquals("[0: [1, 2] 1: [0, 2] 2: [0, 1]]", touchGraph.toString())
    }

    @Test
    fun extractTouchGraph_threeShapes() {
        val img = createColorMatrixBitmap(listOf(
                "wwwwbbbbbbbbbbbb",
                "wwwwbbbbbbbbbbbb",
                "wwwwbbbbbbbbbbbb",
                "wwwwbbbbwwwwwbbb",
                "wwwwbbbbwwwwwbbb",
                "wwwwbbbbwwwwwbbb",
                "wwwwbbbbbbbbbbbb",
                "wwwwbbbbbbbbbbbb",
        ))
        val touchGraph = Graph.fromArrayOfIntArray(ClaycodeDecoder.extractTouchGraph(img, 0, 0, img.width, img.height));

        assertEquals("[0: [1, 2] 1: [0, 2] 2: [0, 1, 3] 3: [2]]", touchGraph.toString())
    }
}