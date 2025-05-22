/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

#pragma once

#include <vector>
#include <unordered_set>

#include "opencv2/opencv.hpp"

/**
 * Given a cv matrix representing the shapes,
 * Returns the diagonal touch graph.
 */
std::vector<std::vector<int>> buildTouchGraph(const cv::Mat &image_shapes, int num_shapes)
{
    // Initialize the adjacency list using a vector of sets to avoid duplicates
    std::vector<std::unordered_set<int>> adjacency_sets;
    adjacency_sets.reserve(num_shapes);
    for (int i = 0; i < num_shapes; ++i)
    {
        std::unordered_set<int> set;
        set.reserve(num_shapes);
        adjacency_sets.push_back(std::move(set));
    }

    int rows = image_shapes.rows;
    int cols = image_shapes.cols;

    // Direction vectors for Right, Bottom, Bottom-Right, Bottom-Left
    std::vector<std::pair<int, int>> directions = {{0, 1}, {1, 0}, {1, 1}, {1, -1}};

    for (int row = 0; row < rows; ++row)
    {
        for (int col = 0; col < cols; ++col)
        {
            int current_shape = image_shapes.at<int>(row, col);

            for (auto &[dr, dc] : directions)
            {
                int new_row = row + dr;
                int new_col = col + dc;
                bool is_row_in_range = new_row >= 0 && new_row < rows;
                bool is_col_in_range = new_col >= 0 && new_col < cols;

                if (is_row_in_range && is_col_in_range)
                {
                    int adjacent_shape = image_shapes.at<int>(new_row, new_col);
                    if (current_shape != adjacent_shape)
                    {
                        adjacency_sets[current_shape].insert(adjacent_shape);
                        adjacency_sets[adjacent_shape].insert(current_shape);
                    }
                }
            }
        }
    }

    // Convert the set of adjacency lists into a vector of vectors
    std::vector<std::vector<int>> adjacency_list(num_shapes);
    for (int i = 0; i < num_shapes; ++i)
    {
        adjacency_list[i].assign(adjacency_sets[i].begin(), adjacency_sets[i].end());
    }

    return adjacency_list;
}