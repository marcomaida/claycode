/*
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

/**
 * Downloads a blob as a file with the specified name
 * @param {Blob} blob - The blob to download
 * @param {string} fileName - The name to give the downloaded file
 */
export function downloadBlob(blob, fileName) {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    
    // Trigger the download
    document.body.appendChild(link);  // Append the link to the document body (required for Firefox)
    link.click();
    document.body.removeChild(link); // Remove the link from the document
    URL.revokeObjectURL(link.href); // Release the blob URL
}