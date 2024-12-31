#pragma once

#include "opencv2/opencv.hpp"
#include "opencv2/imgproc.hpp"
#include "opencv2/highgui.hpp"
#include <vector>
#include <random>

cv::Mat smoothImage(const cv::Mat &image, double sigma)
{
    /**
     * Stage 1: Smoothing
     * Apply Gaussian smoothing to each channel of the BGR image.
     */
    cv::Mat smoothedImage;
    cv::GaussianBlur(image, smoothedImage, cv::Size(0, 0), sigma);
    return smoothedImage;
}

cv::Mat rgbToLab(const cv::Mat &image)
{
    /**
     * Stage 2: Dimension Lifting
     * Convert the BGR image to the Lab color space.
     */
    cv::Mat labImage;
    cv::cvtColor(image, labImage, cv::COLOR_BGR2Lab);
    return labImage;
}

cv::Mat combineRgbLab(const cv::Mat &rgbImage, const cv::Mat &labImage)
{
    /**
     * Combine the BGR and Lab channels into a single image for clustering.
     */
    std::vector<cv::Mat> channels;
    cv::split(rgbImage, channels);
    cv::Mat labChannels[3];
    cv::split(labImage, labChannels);

    channels.push_back(labChannels[0]);
    channels.push_back(labChannels[1]);
    channels.push_back(labChannels[2]);

    cv::Mat combinedImage;
    cv::merge(channels, combinedImage);
    return combinedImage;
}

std::pair<cv::Mat, cv::Mat> kmeansSegmentation(const cv::Mat &image, int k)
{
    /**
     * Apply K-means clustering to segment the image into K segments.
     * Also retrieve the palette of cluster centers.
     */
    // Reshape the image to a 2D array of pixels
    cv::Mat reshapedImage = image.reshape(1, image.rows * image.cols);
    reshapedImage.convertTo(reshapedImage, CV_32F); // Convert to float32 for K-means

    // Apply K-means clustering
    cv::Mat labels, centers;
    cv::kmeans(reshapedImage, k, labels,
               cv::TermCriteria(cv::TermCriteria::EPS + cv::TermCriteria::COUNT, 10, 1.0),
               3, cv::KMEANS_PP_CENTERS, centers);

    // Reshape the labels back to the original image dimensions
    cv::Mat segmented = labels.reshape(1, image.rows);

    // Centers (palette) are returned as a matrix of size k x 3 (for RGB channels)
    centers.convertTo(centers, CV_32F); // Ensure palette is in float format

    return {segmented, centers};
}

cv::Mat colorClusteredImage(const cv::Mat &clusteredImage, const cv::Mat &palette)
{
    /**
     * Color the clustered image according to the palette colors.
     *
     * Args:
     *     clusteredImage: Clustered image with labels.
     *     palette: Palette of colors (k x 3 matrix).
     *
     * Returns:
     *     coloredImage: Image colored according to the palette.
     */
    int rows = clusteredImage.rows;
    int cols = clusteredImage.cols;
    cv::Mat coloredImage(rows, cols, CV_8UC3);

    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            int label = clusteredImage.at<int>(i, j);       // Cluster label
            cv::Vec3f color = palette.at<cv::Vec3f>(label); // Get the RGB color from the palette
            coloredImage.at<cv::Vec3b>(i, j) = cv::Vec3b(color[0], color[1], color[2]);
        }
    }

    return coloredImage;
}

cv::Mat slatFilters(const cv::Mat &inputImage, int k)
{
    cv::Mat bgrImage;
    cv::cvtColor(inputImage, bgrImage, cv::COLOR_RGB2BGR); // Convert from RGB to BGR

    // Stage 1: Smooth the image
    cv::Mat smoothedImage = smoothImage(bgrImage, 2.0);

    // Stage 2: Dimension lifting to Lab color space
    cv::Mat labImage = rgbToLab(smoothedImage);

    // Combine the BGR and Lab images
    cv::Mat combinedImage = combineRgbLab(smoothedImage, labImage);

    // Stage 3: Apply K-means segmentation
    auto imageAndPalette = kmeansSegmentation(combinedImage, k);

    cv::Mat coloredImage = colorClusteredImage(imageAndPalette.first, imageAndPalette.second);

    return coloredImage;
}