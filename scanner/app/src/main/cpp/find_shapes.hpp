#pragma once

#include "opencv2/opencv.hpp"
#include <stack>

void floodFillIterative(cv::Mat &image, int x, int y, cv::Vec3b current_color, int shape_id, cv::Mat &shape_image)
{
    int rows = image.rows;
    int cols = image.cols;
    std::stack<std::pair<int, int>> stack;
    stack.push({x, y});

    while (!stack.empty())
    {
        auto [cx, cy] = stack.top();
        stack.pop();

        // Check if current position is valid
        if (cx < 0 || cx >= rows || cy < 0 || cy >= cols ||
            shape_image.at<int>(cx, cy) != -1 ||
            image.at<cv::Vec3b>(cx, cy) != current_color)
        {
            continue;
        }

        // Mark the current pixel with the shape_id
        shape_image.at<int>(cx, cy) = shape_id;

        // Add neighbors to the stack (4-way connectivity)
        stack.push({cx + 1, cy});
        stack.push({cx - 1, cy});
        stack.push({cx, cy + 1});
        stack.push({cx, cy - 1});
    }
}

/**
 * Function to find color shapes in the image
 * Returns an integer matrix of the same shape as the input image.
 * Each integer represents the shape owning the pixel at the given position.
 * The function replaces all the border pixels with the zeroth class, which
 * must be there as the Erosion algorithm requires a padding
 *
 * E.g.,
 *   X XXXX       000000
 *   X XXXX       012220
 *   X    X   =>  011110
 *   XXXXXX       033330
 *   XXXXXX       000000
 */
std::pair<cv::Mat, int> findColorShapes(cv::Mat &image)
{
    int rows = image.rows;
    int cols = image.cols;
    cv::Mat segmented_image = cv::Mat(rows, cols, CV_32S, cv::Scalar(-1)); // Image to hold shapes identifiers

    // Add border shape equal to zero ("S0")
    segmented_image.row(0).setTo(cv::Scalar(0));
    segmented_image.row(rows - 1).setTo(cv::Scalar(0));
    for (int i = 0; i < rows; ++i) {
        segmented_image.at<int>(i, 0) = 0;
    }
    for (int i = 0; i < rows; ++i) {
        segmented_image.at<int>(i, cols - 1) = 0;
    }

    int shape_id = 1;
    for (int x = 1; x < rows; ++x)
    {
        for (int y = 0; y < cols; ++y)
        {
            if (segmented_image.at<int>(x, y) == -1)
            { // If the pixel hasn't been visited
                cv::Vec3b current_color = image.at<cv::Vec3b>(x, y);
                floodFillIterative(image, x, y, current_color, shape_id, segmented_image);
                shape_id++; // Increment the shape_id for the next shape
            }
        }
    }

    return {segmented_image, shape_id};
}