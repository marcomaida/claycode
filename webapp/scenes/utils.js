import { textToBits } from "../conversion/convert.js";
import { drawPolygonVertices, initDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { DefaultBrush, PackerBrush } from "../packer/packer_brush.js";
import { createMouseHeadPolygon, createCirclePolygon, createHeartPolygon, createStarPolygon, createUPolygon, createSpiralPolygon } from "../geometry/shapes.js";
import { TreeNode } from "../tree/tree_node.js";
import { packClaycode } from "../packer/pack.js";
import { downloadBlob } from "../common/utils/download.js";


export function initPIXI() {
  // Get the size of the container
  const width = pixiDiv.offsetWidth;
  const height = pixiDiv.offsetHeight;
  const resolution = window.devicePixelRatio || 1;

  // Create the PIXI application with logical size
  const app = new PIXI.Application({
    width,
    height,
    resolution,
    antialias: true,
  });
  initDrawing(app);

  // Set the CSS size to match the container, so the canvas is scaled down/up
  app.view.style.width = `${width}px`;
  app.view.style.height = `${height}px`;

  pixiDiv.appendChild(app.view);

  return app;
}

/**
 * Since scripts start before the page is fully loaded, sometimes components
 * cannot be found. Keep trying until they are available.
 * May never return.
 */
export async function getElementByIdAndKeepTrying(element_name) {
  while (document.getElementById(element_name) === null) {
    await new Promise((r) => setTimeout(r, 100));
  }

  return document.getElementById(element_name);
}

export async function initInputText() {
  const inputTextBox = await getElementByIdAndKeepTrying("inputText");
  inputTextBox.select();
  inputTextBox.focus();
  return inputTextBox;
}

export function initInfoText() {
  const infoText = document.getElementById("infoText");
  infoText.textContent = "";
  return infoText;
}

export function updateInfoText(inputText, currentTree, infoSuffix = "") {
  const infoText = document.getElementById("infoText");
  if (inputText !== null)
    infoText.textContent =
      `${inputText.length} Chars | ${textToBits(inputText).length} bits | ${currentTree.root.numDescendants
      } Nodes | Footprint: ${currentTree.get_total_footprint()} ` + infoSuffix;
  else
    infoText.textContent =
      `${currentTree.root.numDescendants} Nodes | Footprint: ${currentTree.get_total_footprint()}` + infoSuffix;
}

// Helper function to avoid too many calls to the drawing function
// by fast-repeating keystrokes
export function debounce(func, delay, timerId) {
  infoText.textContent = `Packing...`;
  clearTimeout(timerId);
  return setTimeout(func, delay);
}

export async function showChangeShapeLabel(isVisible, message = "Change Shape") {
  const changeShapeDiv = await getElementByIdAndKeepTrying("changeShapeDiv");
  changeShapeDiv.style.visibility = isVisible ? "visible" : "collapse";
  const changeShapeText = await getElementByIdAndKeepTrying("changeShapeText");
  changeShapeText.textContent = message;
}

// Shape management
export const POLYGON_SHAPES = [
  (center, size) => createCirclePolygon(center, size, 4, new PIXI.Vec(1, 1), 45),
  (center, size) => createCirclePolygon(center, size, 50, new PIXI.Vec(1, 1), 0),
  (center, size) => createCirclePolygon(center, size, 3, new PIXI.Vec(1, 1), 0),
  (center, size) => createCirclePolygon(center, size, 4, new PIXI.Vec(1.5, 0.7), 45),
  (center, size) => createHeartPolygon(center, size, 70),
  (center, size) => createMouseHeadPolygon(center, size / 2, 30),
  (center, size) => createStarPolygon(center, size, 5),
  (center, size) => createSpiralPolygon(center, size, 3, 70, 0.05, 0.15, 0.5),
];
export function getPolygonOfIndex(index, polygonCenter, polygonSize) {
  return POLYGON_SHAPES[index](polygonCenter, polygonSize);
}

export function drawPolygonClaycode(
  current_tree,
  polygon
) {
  // Uncomment to see the polygon's vertices
  // drawPolygonVertices(polygon);
  if (packClaycode(current_tree, polygon)) {
    let brush = new DefaultBrush();
    drawClaycode(current_tree, polygon, brush)
    return true;
  }
  else {
    return false;
  }
}

// This function was used in the evaluation of the paper to generate random alphanumeric strings
export function getRandomAlphanumericString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const nums = [70, 70];
  const idx = Math.ceil(Math.random() * (nums.length - 1));
  const length = nums[idx];
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function downloadClaycode(app) {
  const inputText = document.getElementById("inputText").value;
  const fileName = inputText.substring(0, 20).replace(/[^a-z0-9]/gi, '_') || 'claycode';

  const claycodeElement = app.stage.children[0];
  const bounds = claycodeElement.getBounds();

  // Compute aspect ratio scaling factor
  const originalWidth = bounds.width;
  const originalHeight = bounds.height;
  const maxDimension = Math.max(originalWidth, originalHeight);

  // Scale so that the largest side becomes exactly 2048
  const targetMax = 2048;
  const scaleFactor = targetMax / maxDimension;

  const targetWidth = Math.round(originalWidth * scaleFactor);
  const targetHeight = Math.round(originalHeight * scaleFactor);

  // Create render texture with target dimensions
  const renderTexture = PIXI.RenderTexture.create({
    width: targetWidth,
    height: targetHeight,
    resolution: 1,
  });

  // Prepare a temporary container and scale it
  const tempContainer = new PIXI.Container();
  const clone = claycodeElement.clone();
  clone.position.set(-bounds.x * scaleFactor, -bounds.y * scaleFactor);
  clone.scale.set(scaleFactor);

  tempContainer.addChild(clone);

  // Render the scene
  app.renderer.render(tempContainer, {
    renderTexture,
    clear: true,
    skipUpdateTransform: false,
  });

  const canvas = app.renderer.plugins.extract.canvas(renderTexture);

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  canvas.toBlob((blob) => {
    downloadBlob(blob, `${fileName}.png`);
  }, 'image/png');
}





