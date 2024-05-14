#include <jni.h>
#include <string>
#include <vector>
#include <chrono>

#include <jni.h>
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

void logRelativeTime(const std::string& tag, std::chrono::time_point<std::chrono::steady_clock> startTime) {
    auto currentTime = std::chrono::steady_clock::now();
    auto delta = std::chrono::duration_cast<std::chrono::milliseconds>(currentTime - startTime).count();

    LOGI("Performance", "%s:%lld", tag.c_str(), delta);
}

extern "C" JNIEXPORT jobjectArray JNICALL
Java_com_claycode_scanner_ClaycodeDecoder_00024Companion_extractTouchGraph(
    JNIEnv *env,
    jobject /* this */,
    jobject bitmap)
{
    auto startTime = std::chrono::high_resolution_clock::now();
    /*****************
     * Validate input bitmap
     *****************/
    AndroidBitmapInfo info;
    void *pixels;
    if (AndroidBitmap_getInfo(env, bitmap, &info) < 0)
    {
        return nullptr; // Error handling
    }
    if (info.format != ANDROID_BITMAP_FORMAT_RGBA_8888)
    {
        return nullptr; // Handle incompatible bitmap
    }
    if (AndroidBitmap_lockPixels(env, bitmap, &pixels) < 0)
    {
        return nullptr; // Error handling
    }

    /*****************
     * Apply OpenCV pipeline
     *****************/
    cv::Mat img(info.height, info.width, CV_8UC4, pixels);

    // Discard alpha
    cv::cvtColor(img, img, cv::COLOR_RGBA2RGB);

    // Convert to RGB (is this needed?)
    // cv::cvtColor(img, rgb_img, cv::COLOR_BGRA2RGBA);

    // Mean Shift Filtering
    // cv::pyrMeanShiftFiltering(img, img, 10, 100);
    // Convert to grayscale
    cv::Mat gray_image;
    cv::cvtColor(img, gray_image, cv::COLOR_BGR2GRAY);
    // Thresholding
    cv::Mat binary_image;
    cv::threshold(gray_image, binary_image, 127, 255, cv::THRESH_BINARY);
    // Turn the gray image back to BGR.
    // Note that this is wasteful at the moment, but int he future
    // we want to support coloured Claycodes. Hence, we want to build the rest of
    // the code for BGR images.
    cv::cvtColor(binary_image, img, cv::COLOR_GRAY2BGR);

    logRelativeTime("OpenCV", startTime);

    /*****************
     * Compute color shapes
     *****************/

    auto [shapes_image, shapes_num] = findColorShapes(img);

    // Unlocking pixels after processing
    AndroidBitmap_unlockPixels(env, bitmap);

    logRelativeTime("Compute Color Shapes", startTime);

    /*****************
     * Build touch graph
     *****************/
    std::vector<std::vector<int>> touch_graph = buildTouchGraph(shapes_image, shapes_num);

    logRelativeTime("Build Touch Graph", startTime);
    /*****************
     * Populate output array
     *****************/
    int rows = touch_graph.size();

    // Find the class representing an array of integers
    jclass int_class_array = env->FindClass("[I");
    if (int_class_array == nullptr)
        return nullptr; // TODO Error handling

    // Create the outer jobjectArray (array of int arrays)
    jobjectArray result = env->NewObjectArray(rows, int_class_array, nullptr);
    if (result == nullptr)
        return nullptr; // TODO Error handling

    for (int i = 0; i < rows; ++i)
    {
        int cols = touch_graph[i].size();
        jintArray inner_array = env->NewIntArray(cols);
        if (inner_array == nullptr)
            return nullptr; // TODO Error handling

        // Copy the data from the vector to the jintArray
        env->SetIntArrayRegion(inner_array, 0, cols, &touch_graph[i][0]);
        // Set the jintArray in the jobjectArray
        env->SetObjectArrayElement(result, i, inner_array);
        // Clean up local reference
        env->DeleteLocalRef(inner_array);
    }

    logRelativeTime("Populate Output Array", startTime);

    return result;
}