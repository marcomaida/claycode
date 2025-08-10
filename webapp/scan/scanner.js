/*!
 * Copyright (c) 2025 Claycode
 * Licensed under the MIT License with the Commons Clause.
 * Commercial use is prohibited without a separate license.
 * See LICENSE in the project root for details.
 * SPDX-License-Identifier: MIT AND Commons-Clause
 */

import {
    TopologyAnalyzer,
    BitTreeConverter,
    BitsValidator,
    TextBitsConverter,
    FpsCounter
} from '../common/index.js';

const ENABLE_ZOOM = true; // Set to false to disable zoom

class ClaycodeWebScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.isScanning = false;
        this.fpsCounter = new FpsCounter(50); // Using common FpsCounter
        this.analysisEnabled = true;
        this.zoomFactor = 1.0; // Start at 1.0 (no zoom)

        this.initializeCamera();
        this.setupEventListeners();
    }

    // Check if text is a valid URL
    isValidUrl(text) {
        // Simple URL regex that matches with or without http/https/www
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        return urlRegex.test(text.trim());
    }

    // Format URL to ensure it has http:// prefix
    formatUrl(url) {
        url = url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1920 }
                }
            });
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.waitForOpenCV();
            };
        } catch (err) {
            console.error('Camera access failed:', err);
            document.getElementById('info-box').textContent = 'Camera access denied';
        }
    }

    waitForOpenCV() {
        if (typeof cv !== 'undefined' && cv.Mat) {
            document.getElementById('loading').style.display = 'none';
            this.startScanning();
        } else {
            setTimeout(this.waitForOpenCV.bind(this), 100);
        }
    }

    startScanning() {
        this.isScanning = true;
        this.scanFrame();
    }

    scanFrame() {
        if (!this.isScanning || !this.analysisEnabled) {
            requestAnimationFrame(() => this.scanFrame());
            return;
        }

        this.ctx.drawImage(this.video, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        try {
            const result = this.processFrame(imageData);
            this.updateUI(result);
        } catch (err) {
            console.error('Processing error:', err);
        }

        requestAnimationFrame(() => this.scanFrame());
    }

    getNextZoomFactor() {
        if (!ENABLE_ZOOM) return 1.0; // No zoom if disabled
        // Cycle zoom between 1.0 and 2.0 in steps of 0.1
        this.zoomFactor += 0.05;
        if (this.zoomFactor > 1.5) this.zoomFactor = 1.0;
        return this.zoomFactor;
        // Alternatively, for random zoom:
        // return 1.0 + Math.random();
    }

    processFrame(imageData) {
        const startTime = performance.now();

        // Create OpenCV Mat from ImageData
        const src = cv.matFromImageData(imageData);

        // --- Crop to match the on-screen target square (90% of min dimension, centered) ---
        const minDim = Math.min(src.cols, src.rows);
        const squareSize = Math.floor(minDim * 0.9);
        const left = Math.floor((src.cols - squareSize) / 2);
        const top = Math.floor((src.rows - squareSize) / 2);

        // Crop to target region
        const cropRect = new cv.Rect(left, top, squareSize, squareSize);
        let cropped = src.roi(cropRect);

        // --- Add random/cycled zoom ---
        const zoomFactor = this.getNextZoomFactor();
        const zoomedWidth = Math.floor(cropped.cols / zoomFactor);
        const zoomedHeight = Math.floor(cropped.rows / zoomFactor);
        const xOffset = Math.floor((cropped.cols - zoomedWidth) / 2);
        const yOffset = Math.floor((cropped.rows - zoomedHeight) / 2);
        const zoomRect = new cv.Rect(xOffset, yOffset, zoomedWidth, zoomedHeight);
        let zoomed = cropped.roi(zoomRect);

        // Resize back to original cropped size for consistent processing
        let resized = new cv.Mat();
        cv.resize(zoomed, resized, new cv.Size(cropped.cols, cropped.rows));

        // Convert to grayscale
        const gray = new cv.Mat();
        cv.cvtColor(resized, gray, cv.COLOR_RGBA2GRAY);

        // Bilateral filter
        const imgBil = new cv.Mat();
        cv.bilateralFilter(gray, imgBil, 3, 75, 75, cv.BORDER_DEFAULT);

        // Adaptive threshold
        const width = imgBil.cols;
        const height = imgBil.rows;
        let kernelSize = Math.max(Math.floor(13 * width * height / 1000000), 9);
        if (kernelSize % 2 === 0) {
            kernelSize += 1;
        }
        const thresh = new cv.Mat();
        cv.adaptiveThreshold(
            imgBil,
            thresh,
            255,
            cv.ADAPTIVE_THRESH_MEAN_C,
            cv.THRESH_BINARY,
            kernelSize,
            4
        );

        // --- Show processed image on screen ---
        const processedCanvas = document.getElementById('processed-canvas');
        if (processedCanvas && window.showing) {
            processedCanvas.width = thresh.cols;
            processedCanvas.height = thresh.rows;
            const processedCtx = processedCanvas.getContext('2d');
            // Convert single-channel Mat to RGBA for display
            const displayMat = new cv.Mat();
            cv.cvtColor(thresh, displayMat, cv.COLOR_GRAY2RGBA);
            const imgData = new ImageData(
                new Uint8ClampedArray(displayMat.data),
                displayMat.cols,
                displayMat.rows
            );
            processedCtx.putImageData(imgData, 0, 0);
            displayMat.delete();
        }
        // --- End show processed image ---

        // Optional: Dilate (uncomment if needed)
        // const element = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
        // cv.dilate(thresh, thresh, element, new cv.Point(-1, -1), 1);

        // Find contours
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(thresh, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
        // Build parents array from hierarchy
        const parentsArray = this.buildParentsArray(hierarchy);

        // Find potential claycodes
        const result = this.findPotentialClaycodes(parentsArray);

        // Cleanup
        src.delete();
        cropped.delete();
        zoomed.delete();
        resized.delete();
        gray.delete();
        imgBil.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();

        const processingTime = performance.now() - startTime;
        const fps = this.fpsCounter.addSample(Date.now());

        return {
            potentialCount: result.potentialCount,
            foundCount: result.foundCount,
            decodedText: result.decodedText,
            processingTime,
            fps,
            dimensions: `${this.canvas.width}x${this.canvas.height}`
        };
    }

    buildParentsArray(hierarchy) {
        if (hierarchy.cols === 0) return [0];

        const parents = [0]; // Add S0 parent
        const numContours = hierarchy.cols;

        for (let i = 0; i < numContours; i++) {
            const parentIdx = hierarchy.data32S[i * 4 + 3]; // Parent index from hierarchy
            parents.push(parentIdx === -1 ? 0 : parentIdx + 1); // Adjust for S0 offset
        }


        return parents;
    }

    findPotentialClaycodes(parentsArray) {
        // Build tree fro
        // m parents array
        const tree = TopologyAnalyzer.buildTreeFromParentsArray(parentsArray, 0);

        // Find potential claycode roots
        const potentialRoots = TopologyAnalyzer.findPotentialClaycodeRoots(tree);

        // Try to decode found patterns
        let foundCount = 0;
        let decodedText = "";

        for (const root of potentialRoots) {
            const bits = BitTreeConverter.treeToBits(root);
            const validatedBits = BitsValidator.getValidatedBitString(bits);

            if (validatedBits) {
                const text = TextBitsConverter.bitsToText(validatedBits);
                if (text && text.length > 0 && !text.startsWith('[Claycode]')) {
                    foundCount++;
                    decodedText = text;

                    this.showResult(decodedText);
                    break;
                }
            }
        }

        return {
            potentialCount: potentialRoots.length,
            foundCount,
            decodedText
        };
    }

    updateUI(result) {
        document.getElementById('fps-counter').textContent = `${result.fps.toFixed(1)} FPS`;
        document.getElementById('info-box').textContent =
            `(${result.dimensions}) -- Potential Claycodes: ${result.potentialCount}`;
        document.getElementById('resolution-label').textContent = result.dimensions;
    }

    showResult(decodedText) {
        // Capture current frame
        const resultCanvas = document.createElement('canvas');
        const resultCtx = resultCanvas.getContext('2d');
        resultCanvas.width = this.canvas.width;
        resultCanvas.height = this.canvas.height;
        resultCtx.drawImage(this.video, 0, 0);

        // Show result modal
        document.getElementById('result-image').src = resultCanvas.toDataURL();
        document.getElementById('result-text').textContent = decodedText;
        document.getElementById('result-modal').style.display = 'flex';

        // Check if the decoded text is a URL
        const isUrl = this.isValidUrl(decodedText);

        // Show appropriate buttons based on content type
        const copyButton = document.getElementById('copy-button');
        const openUrlButton = document.getElementById('open-url-button');
        
        if (isUrl) {
            if (copyButton) copyButton.style.display = 'inline-block';
            if (openUrlButton) {
                openUrlButton.style.display = 'inline-block';
                openUrlButton.onclick = () => {
                    const url = this.formatUrl(decodedText);
                    window.open(url, '_blank');
                };
            }
        } else {
            if (copyButton) copyButton.style.display = 'inline-block';
            if (openUrlButton) openUrlButton.style.display = 'none';
        }

        // Pause analysis
        this.analysisEnabled = false;
    }

    setupEventListeners() {
        document.getElementById('close-result').addEventListener('click', () => {
            document.getElementById('result-modal').style.display = 'none';
            this.analysisEnabled = true;
        });

        document.getElementById('container').addEventListener('click', () => {
            if (document.getElementById('result-modal').style.display === 'flex') {
                document.getElementById('result-modal').style.display = 'none';
                this.analysisEnabled = true;
            }
        });

        // Add event listener for copy button if it exists
        const copyButton = document.getElementById('copy-button');
        if (copyButton) {
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing the modal
                const text = document.getElementById('result-text').textContent;
                navigator.clipboard.writeText(text)
                    .then(() => {
                        copyButton.textContent = 'Copied!';
                        setTimeout(() => {
                            copyButton.textContent = 'Copy to Clipboard';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
            });
        }

        // Add event listener for open URL button if it exists
        const openUrlButton = document.getElementById('open-url-button');
        if (openUrlButton) {
            openUrlButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing the modal
            });
        }
    }
}

// Initialize scanner when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Load the header using the same method as page_loader.js
    const headerDiv = document.getElementById("headerDiv");
    if (headerDiv) {
        try {
            const response = await fetch("/pages/header.html");
            const html = await response.text();
            headerDiv.innerHTML = html;

            // Highlight the current page in the header
            const currentPath = window.location.pathname;
            const headerLinks = headerDiv.querySelectorAll('.header-nav a');
            headerLinks.forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.classList.add('header-element');
                }
            });
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    new ClaycodeWebScanner();

    // Set up toggle button for processed view
    const btn = document.getElementById('toggle-processed-view');
    const processedCanvas = document.getElementById('processed-canvas');
    window.showing = false;
    if (btn && processedCanvas) {
        btn.addEventListener('click', () => {
            window.showing = !window.showing;
            processedCanvas.style.display = window.showing ? 'block' : 'none';
            btn.textContent = window.showing ? 'Hide Processed View' : 'Show Processed View';
        });
    }
});