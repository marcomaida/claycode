import { } from "../geometry/vector.js";
import { area } from "../geometry/geometry.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { circlePolygon } from "../geometry/geometry.js";
import { updateInfoText, initInfoText, initPIXI } from "./utils.js";
import { Tree } from "../tree/tree.js";
import { generateRandomTree } from "../tree/util.js";
import { createBinaryImage } from "../image_processing/binary_image.js"
import { computeContourPolygons } from "../image_processing/contour.js"
import { drawPolygon } from "../packer/draw.js";

const app = initPIXI();
const infoText = initInfoText();
const inputTreeTopology = document.getElementById("inputTreeTopology");
const inputNumFragments = document.getElementById("inputNumFragments");
const inputNumNodes = document.getElementById("inputNumNodes");

let current_texture = null;
let current_sprite = null;
let current_polygons = null;


let SHAPES = [
  // [num_edges, scale, rotation_deg]
  [4, new PIXI.Vec(1, 1), 45],
];
let current_shape = 0;

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

// Debug default picture
let imageUrl = `${window.location.origin}/images/testpug.png`
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

  let current_tree = Tree.fromString(inputTreeTopology.value)
  if (!current_tree) {
    inputTreeTopology.value = generateRandomTree(inputNumNodes.value).toString();
    current_tree = Tree.fromString(inputTreeTopology.value)
    if (!current_tree) {
      throw `current tree cannot be null after the tree was generated`;
    }
  }

  let polygon = circlePolygon(
    new PIXI.Vec(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2),
    SPRITE_DIMENSION * 0.707106, // Here we provide the RADIUS, so multiply by (sqrt(1/2 * 1/2 * 2))
    SHAPES[current_shape][0],
    SHAPES[current_shape][1],
    SHAPES[current_shape][2]
  );

  // Try to draw for a certain max number of times
  const MAX_TRIES = 10; // TODO put back to reasonable number
  let tries = 0;

  // Start with large padding, decrease at each fail
  let baseline_padding = Math.lerp(
    20,
    2,
    Math.min(current_tree.root.numDescendants, 300) / 300
  );

  let node_padding_max = baseline_padding;
  let node_padding_min = 2;

  while (tries < MAX_TRIES) {
    // Decrease padding if it keeps failing
    const padding = Math.lerp(
      node_padding_max,
      node_padding_min,
      tries / MAX_TRIES
    );
    current_tree.compute_weights(padding);

    let min_node_area = area(polygon) * 0.0002;

    try {
      clearDrawing();
      drawClaycode(current_tree.root, polygon, padding, min_node_area);
      break;
    } catch (error) {
      tries++;
      if (tries == MAX_TRIES) {
        clearDrawing();
        infoSuffix += "- Failed to Pack :(";
        break;
      }
    }
  }

  updateInfoText(null, current_tree, infoSuffix);

  // TODO: turn into fragment packing
  if (current_polygons) {
    for (let polygon of current_polygons) {
      drawPolygon(polygon, 0xFF0000);
    }
  }
}

