#include <jni.h>
#include <string>
#include "opencv2/opencv.hpp"
#include <android/bitmap.h>
#include <jni.h>
#include <vector>
#include <iostream>

// Add macros to log
#include <android/log.h>
#define TAG "TopologyExtractorC++"
#define LOGV(...) __android_log_print(ANDROID_LOG_VERBOSE, TAG,__VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG  , TAG,__VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO   , TAG,__VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN   , TAG,__VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR  , TAG,__VA_ARGS__)

extern "C" JNIEXPORT jobjectArray JNICALL
Java_com_claycode_scanner_ClaycodeDecoder_00024Companion_extractTouchGraph(
        JNIEnv* env,
        jobject /* this */,
        jobject bitmap) {

    /*****************
    * Validate input bitmap
    *****************/
    AndroidBitmapInfo info;
    void* pixels;
    if (AndroidBitmap_getInfo(env, bitmap, &info) < 0) {
        return nullptr; // Error handling
    }
    if (info.format != ANDROID_BITMAP_FORMAT_RGBA_8888) {
        return nullptr; // Handle incompatible bitmap
    }
    if (AndroidBitmap_lockPixels(env, bitmap, &pixels) < 0) {
        return nullptr; // Error handling
    }


    /*****************
    * (SAMPLE) Use OpenCV to invert pixels
    *****************/
    cv::Mat img(info.height, info.width, CV_8UC4, pixels);
    cv::Mat rgb_img;
    cv::cvtColor(img, rgb_img, cv::COLOR_BGRA2RGBA);
    cv::Mat inverted_img;
    cv::bitwise_not(rgb_img, inverted_img);

    /*****************
    * (SAMPLE) Compute mean pixel
    *****************/

    // Calculate mean of each color channel from the inverted image
    long long totalRed = 0, totalGreen = 0, totalBlue = 0;
    int pixelCount = info.width * info.height;
    uint32_t* line = (uint32_t*)inverted_img.data;
    for (size_t y = 0; y < info.height; ++y) {
        for (size_t x = 0; x < info.width; ++x) {
            uint32_t pixel = line[x];
            uint8_t red = (uint8_t)((pixel >> 16) & 0xFF);
            uint8_t green = (uint8_t)((pixel >> 8) & 0xFF);
            uint8_t blue = (uint8_t)(pixel & 0xFF);

            totalRed += red;
            totalGreen += green;
            totalBlue += blue;
        }
        line = (uint32_t*)((char*)line + inverted_img.step);
    }

    int meanRed = totalRed / pixelCount;
    int meanGreen = totalGreen / pixelCount;
    int meanBlue = totalBlue / pixelCount;

    // Unlocking pixels after processing
    AndroidBitmap_unlockPixels(env, bitmap);

    /*****************
    * (SAMPLE) Populate output, currently size + the mean pixel
    * (this will become the touch graph)
    * Note that we first build a C++ vector and then the JObject, but
    * we do not need to do it like this.
    *****************/
    std::vector<std::vector<int>> data = {
            {static_cast<int>(info.width), static_cast<int>(info.height)},
            {meanRed, meanGreen, meanBlue}
    };
    int rows = data.size();

    // Example log
    LOGI("mean: %d,%d,%d info: size %d x %d", meanRed, meanGreen, meanBlue, info.width, info.height);

    // Find the class representing an array of integers
    jclass intArrayClass = env->FindClass("[I");
    if (intArrayClass == nullptr) return nullptr;  // TODO Error handling

    // Create the outer jobjectArray (array of int arrays)
    jobjectArray result = env->NewObjectArray(rows, intArrayClass, nullptr);
    if (result == nullptr) return nullptr;  // TODO Error handling

    for (int i = 0; i < rows; ++i) {
        int cols = data[i].size();
        jintArray innerArray = env->NewIntArray(cols);
        if (innerArray == nullptr) return nullptr;  // TODO Error handling

        // Copy the data from the vector to the jintArray
        env->SetIntArrayRegion(innerArray, 0, cols, &data[i][0]);
        // Set the jintArray in the jobjectArray
        env->SetObjectArrayElement(result, i, innerArray);
        // Clean up local reference
        env->DeleteLocalRef(innerArray);
    }

    return result;
}