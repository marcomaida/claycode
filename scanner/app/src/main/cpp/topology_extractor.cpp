/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

#include <jni.h>
#include <string>
#include <vector>
#include <chrono>

#include <android/log.h>
#include <android/bitmap.h>
#include "opencv2/opencv.hpp"

#include "find_shapes.hpp"
#include "build_touch_graph.hpp"

// Add macros to log
#define LOGV(...) __android_log_print(ANDROID_LOG_VERBOSE, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, __VA_ARGS__)

const bool LOG_PERFORMANCE = false;

void logRelativeTime(const std::string &tag, std::chrono::time_point<std::chrono::steady_clock> startTime)
{
    auto currentTime = std::chrono::steady_clock::now();
    auto delta = std::chrono::duration_cast<std::chrono::milliseconds>(currentTime - startTime).count();

    if (LOG_PERFORMANCE) {
        LOGI("ClaycodePerformance", "%s:%lld", tag.c_str(), delta);
    }
}

AndroidBitmapInfo getImageInfo(JNIEnv *env, void **pixels, const jobject &bitmap)
{
    AndroidBitmapInfo info;
    if (AndroidBitmap_getInfo(env, bitmap, &info) < 0 ||
        info.format != ANDROID_BITMAP_FORMAT_RGBA_8888 ||
        AndroidBitmap_lockPixels(env, bitmap, pixels) < 0)
    {
        throw "Invalid input bitmap";
    }

    return info;
}

// Global variable for the zoom factor
float globalZoomFactor = 1.0f;

/**
 * Perform the initial part of the pipeline:
 * - Prepare OpenCV's image
 * - Unlock bitmap image
 * - Crop OpenCV's image as specified
 * - Remove alpha channel
 */
cv::Mat prepareInputImage(JNIEnv *env,
                          const jobject &bitmap, const AndroidBitmapInfo &info, void *pixels,
                          jint left, jint top, jint width, jint height)
{
    if (left < 0 || top < 0 || left + width > info.width || top + height > info.height)
    {
        throw "Invalid image crop region";
    }

    cv::Mat img(info.height, info.width, CV_8UC4, pixels);

    AndroidBitmap_unlockPixels(env, bitmap); // Unlocking pixels after processing
    // Crop
    cv::Rect cropRegion(left, top, width, height);
    img = img(cropRegion);

    auto croppedWidth = width - left;
    auto croppedHeight = height - top;

    // Generate a random zoom level between 1.0 (no zoom) and 2.0 (200% zoom)
    float zoomFactor = globalZoomFactor;
    globalZoomFactor += 0.1;
    if (globalZoomFactor > 2)
    {
        globalZoomFactor = 1.0;
    }

    // Calculate new dimensions for zoomed image
    int zoomedWidth = static_cast<int>(croppedWidth / zoomFactor);
    int zoomedHeight = static_cast<int>(croppedHeight / zoomFactor);

    // Ensure the zoomed region fits within the original image
    int xOffset = (croppedWidth - zoomedWidth) / 2;
    int yOffset = (croppedHeight - zoomedHeight) / 2;

    // Create a ROI for the zoomed region
    cv::Rect zoomRegion(xOffset, yOffset, zoomedWidth, zoomedHeight);
    img = img(zoomRegion);

    // Resize to original dimensions for consistent processing
    cv::resize(img, img, cv::Size(info.width, info.height));

    return img;
}

/**
 * Extract touch graph using OpenCV for preprocessing,
 * and the proprietary stack to infer topology.
 */
extern "C" JNIEXPORT jobjectArray JNICALL
Java_com_claycode_scanner_ClaycodeDecoder_00024Companion_extractTouchGraph(
    JNIEnv *env,
    jobject /* this */,
    jobject bitmap,
    jint left, jint top, jint width, jint height)
{
    auto startTime = std::chrono::high_resolution_clock::now();

    /*****************
     * Validate input bitmap
     *****************/
    void *pixels = nullptr;
    AndroidBitmapInfo info = getImageInfo(env, &pixels, bitmap);

    /*****************
     * Apply OpenCV pipeline
     *****************/
    cv::Mat img = prepareInputImage(env, bitmap, info, pixels, left, top, width, height);

    // Convert to grayscale
    cv::cvtColor(img, img, cv::COLOR_RGBA2GRAY);

    logRelativeTime("OpenCV", startTime);

    /*****************
     * Compute color shapes
     *****************/

    auto [shapes_image, shapes_num] = findColorShapes(img);

    std::stringstream ss;
    ss << "Compute Color Shapes " << img.size().width << "x" << img.size().height;
    logRelativeTime(ss.str(), startTime);

    /*****************
     * Build touch graph
     *****************/
    std::vector<std::vector<int>> touch_graph = buildTouchGraph(shapes_image, shapes_num);

    logRelativeTime("Build Touch Graph", startTime);

    /*****************
     * Populate output array
     *****************/
    int rows = touch_graph.size();

    jclass int_class_array = env->FindClass("[I");
    if (int_class_array == nullptr)
        throw "Unable to find array class";
    jobjectArray result = env->NewObjectArray(rows, int_class_array, nullptr);
    for (int i = 0; i < rows; ++i)
    {
        int cols = touch_graph[i].size();
        jintArray inner_array = env->NewIntArray(cols);
        env->SetIntArrayRegion(inner_array, 0, cols, &touch_graph[i][0]); // Copy the data
        env->SetObjectArrayElement(result, i, inner_array);               // Set the jintArray in the jobjectArray
        env->DeleteLocalRef(inner_array);                                 // Clean up local reference
    }

    logRelativeTime("Populate Output Array", startTime);
    return result;
}

/**
 * Extract a parents array using OpenCV for preprocessing and to infer topology
 */
extern "C" JNIEXPORT jintArray JNICALL
Java_com_claycode_scanner_ClaycodeDecoder_00024Companion_extractParentsArray(
    JNIEnv *env,
    jobject /* this */,
    jobject bitmap,
    jint left, jint top, jint width, jint height)
{
    auto startTime = std::chrono::high_resolution_clock::now();

    /*****************
     * Validate input bitmap
     *****************/
    void *pixels = nullptr;
    AndroidBitmapInfo info = getImageInfo(env, &pixels, bitmap);

    /*****************
     * Apply OpenCV pipeline
     *****************/
    cv::Mat img = prepareInputImage(env, bitmap, info, pixels, left, top, width, height);

    // Convert to grayscale, threshold
    cv::cvtColor(img, img, cv::COLOR_RGBA2GRAY);

    // Bilateral
    cv::Mat img_bil;
    cv::bilateralFilter(img, img_bil, 3, 75, 75);

    // Adaptive threshold
    int kernel_size_threshold = std::max(13 * width * height / 1000000, 9);
    if (kernel_size_threshold % 2 == 0)
    {
        kernel_size_threshold += 1;
    }
    cv::adaptiveThreshold(img_bil, img_bil, 255, cv::ADAPTIVE_THRESH_MEAN_C, cv::THRESH_BINARY, kernel_size_threshold, 4);

    // Dilate
    // cv::Mat element = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(2, 2));
    // cv::dilate(img_bil, img_bil, element, cv::Point(-1, -1), 1);

    std::vector<std::vector<cv::Point>> contours;
    std::vector<cv::Vec4i> hierarchy;
    cv::findContours(img_bil, contours, hierarchy, cv::RETR_TREE, cv::CHAIN_APPROX_SIMPLE);

    logRelativeTime("OpenCV", startTime);

    /*****************
     * Populate output array
     *****************/

    // OpenCV's hierarchy is in the format [next contour in same level, previous, first child, parent]
    // Thus, we only consider the third element.
    // We add a parent shape ("S0") to match the expected format of the rest of the pipeline
    jintArray result = env->NewIntArray(hierarchy.size() + 1);
    auto zero = 0;
    env->SetIntArrayRegion(result, 0, 1, &zero);
    for (size_t i = 0; i < hierarchy.size(); i++)
    {
        int parentIdx = hierarchy[i][3];
        parentIdx += 1; // Add offset to consider S0. OpenCV returns -1 for shapes without parent.
        env->SetIntArrayRegion(result, i + 1, 1, &parentIdx);
    }

    logRelativeTime("Populate Output Array", startTime);

    return result;
}
