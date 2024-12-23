import { } from "../geometry/vector.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { area } from "../geometry/geometry.js";
import { createCirclePolygon } from "../geometry/shapes.js";
import * as utils from "./utils.js";
import { Tree } from "../tree/tree.js";
import { generateRandomTree, duplicateTreeNTimes } from "../tree/util.js";
import { createBinaryImage } from "../image_processing/binary_image.js"
import { computeContourPolygons } from "../image_processing/contour.js"
import { drawPolygon } from "../packer/draw.js";
import { packClaycode } from "../packer/pack.js";


const app = utils.initPIXI();
const infoText = utils.initInfoText();
const inputTreeTopology = document.getElementById("inputTreeTopology");
const inputNumFragments = document.getElementById("inputNumFragments");
const inputNumNodes = document.getElementById("inputNumNodes");

let current_texture = null;
let current_sprite = null;
let current_polygons = null;
let current_frame_color = 0xffffff
let current_fore_color = 0xffffff
let current_back_color = 0x000000

// Helper function to avoid too many calls to the drawing function
// by fast-repeating keystrokes
let timerId;
function debounce(func, delay) {
  infoText.textContent = `Packing...`;
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
}

document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    // NOTE: disabling change shape for now
    // current_shape = (current_shape + 1) % SHAPES.length;
    debounce(imagePolygonView, 100);
  }
  if (event.key == " ") {
    debounce(imagePolygonView, 100);
  }
});


/****** 
 *  DROP MANAGEMENT
 ******/
let dropArea = app.view;
// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}
dropArea.addEventListener('drop', handleDrop, false);
async function handleDrop(e) {
  let file = e.dataTransfer.files[0];

  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = async () => {
    let texture = PIXI.Texture.from(reader.result);
    await loadImage(texture);
  }
}

async function loadImage(texture) {
  if (current_sprite) {
    current_sprite.destroy({ texture: true, baseTexture: true });
    current_sprite = null;
    current_texture = null;
    current_polygons = null;
  }

  current_texture = texture;
  current_sprite = new PIXI.Sprite(current_texture);
  let [WINDOW_WIDTH, WINDOW_HEIGHT, SPRITE_DIMENSION] = getWindowDimension();
  current_sprite.width = SPRITE_DIMENSION;
  current_sprite.height = SPRITE_DIMENSION;
  current_sprite.x = WINDOW_WIDTH / 2;
  current_sprite.y = WINDOW_HEIGHT / 2;
  current_sprite.anchor.set(0.5);
  app.stage.addChild(current_sprite);

  let binaryImage = await createBinaryImage(current_texture, SPRITE_DIMENSION)
  current_polygons = computeContourPolygons(binaryImage, new PIXI.Vec(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2), SPRITE_DIMENSION)

  imagePolygonView();
}

/*****
 * Color management
 */
document.addEventListener('coloris:pick', event => {
  const hexString = event.detail.color.replace('#', '');
  const hexNumber = parseInt(hexString, 16);
  if (event.detail.currentEl.id == "frameColorPicker")
    current_frame_color = hexNumber
  if (event.detail.currentEl.id == "foreColorPicker")
    current_fore_color = hexNumber
  if (event.detail.currentEl.id == "backColorPicker")
    current_back_color = hexNumber
  debounce(imagePolygonView, 300);
});

// Given a set of polygons, and a target number of fragments, 
// distributes the framents so that they best fit in the set of polygons.
// Polygons with more area will proportionally get more fragments
// Polygons with an area smaller than minAreaPerc will get no fragments
function distributeFragments(polygons, targetNumFragments, minAreaPerc) {
  const total_area = polygons.reduce((acc, p) => acc + area(p), 0);
  const minArea = minAreaPerc * total_area;

  const areas = polygons.map((p) => area(p));
  const filteredTotalArea = areas.reduce((acc, curr) => curr >= minArea ? acc + curr : acc, 0);

  const fragmentsDistribution = polygons.map((p) => {
    const polygonArea = area(p);
    if (polygonArea < minArea) {
      return 0;
    }
    const proportion = polygonArea / filteredTotalArea;
    return Math.round(proportion * targetNumFragments);
  });

  return fragmentsDistribution;
}

// Debug default picture
let imageUrl = `${window.location.origin}/images/simplifiedpug.png`
PIXI.Loader.shared.add(imageUrl).load(async (loader, resources) => {
  let texture = PIXI.Texture.from(resources[imageUrl].url);
  await loadImage(texture)
});

imagePolygonView();

inputTreeTopology.addEventListener("input", () => debounce(imagePolygonView, 100));
inputNumFragments.addEventListener("input", () => debounce(imagePolygonView, 100));
inputNumNodes.addEventListener("input", () => {
  inputTreeTopology.value = ""
  debounce(imagePolygonView, 100);
});
window.onresize = function () {
  debounce(imagePolygonView, 50);
};


function getWindowDimension() {
  const WINDOW_WIDTH = window.innerWidth;
  const WINDOW_HEIGHT = window.innerHeight;
  const SPRITE_DIMENSION = Math.min(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);

  return [WINDOW_WIDTH, WINDOW_HEIGHT, SPRITE_DIMENSION];
}

function imagePolygonView() {
  let infoSuffix = ``;
  let [WINDOW_WIDTH, WINDOW_HEIGHT, SPRITE_DIMENSION] = getWindowDimension();

  //****  Get tree
  let current_tree = Tree.fromString(inputTreeTopology.value)
  if (!current_tree) {
    inputTreeTopology.value = generateRandomTree(inputNumNodes.value).toString();
    current_tree = Tree.fromString(inputTreeTopology.value)
    if (!current_tree) {
      throw `current tree cannot be null after the tree was generated`;
    }
  }

  //****  Draw background and border
  let BORDER_SIZE = 0.05
  let borderExternal = createCirclePolygon(
    new PIXI.Vec(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2),
    SPRITE_DIMENSION * (0.707106 + BORDER_SIZE), // Here we provide the RADIUS, so multiply by (sqrt(1/2 * 1/2 * 2))
    4, new PIXI.Vec(1, 1), 45
  );
  let borderInternal = createCirclePolygon(
    new PIXI.Vec(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2),
    SPRITE_DIMENSION * 0.707106, // Here we provide the RADIUS, so multiply by (sqrt(1/2 * 1/2 * 2))
    4, new PIXI.Vec(1, 1), 45
  );
  clearDrawing();

  drawPolygon(borderExternal, current_frame_color);
  drawPolygon(borderInternal, current_back_color);

  if (current_polygons) {
    //*** Distribute fragments
    let MIN_AREA_PERC = 0.0 // if a polygon occupies less than this percent of the total area, it is ignored
    let fragmentsDistribution = distributeFragments(current_polygons, inputNumFragments.value, MIN_AREA_PERC)
    infoSuffix += ` - [${fragmentsDistribution}]`;

    for (let i = 0; i < current_polygons.length; i++) {
      let numFragmentsToDraw = fragmentsDistribution[i]
      let polygon = current_polygons[i]

      // Generate a tree that contains the number of fragments we want
      // NOTE: if the number of input fragment is one, this function will add
      // an extra root, which IS currently needed by the scanner.
      let tree = null;
      if (numFragmentsToDraw == 0) {
        // Polygon is too small. Just draw a little random tree to fill space
        tree = generateRandomTree(10);
      }
      else {
        tree = duplicateTreeNTimes(current_tree, numFragmentsToDraw);
      }

      const success = utils.drawPolygonClaycode(
        current_tree,
        polygon
      );
      utils.updateInfoText(
        null,
        current_tree,
        success ? "" : "- Failed to Pack :("
      );
    }
  }

  utils.updateInfoText(null, current_tree, infoSuffix);
}

