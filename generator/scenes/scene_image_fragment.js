import { } from "../geometry/vector.js";
import { area } from "../geometry/geometry.js";
import { } from "../geometry/math.js";
import { clearDrawing } from "../packer/draw.js";
import { drawClaycode } from "../packer/draw_polygon_claycode.js";
import { circlePolygon } from "../geometry/geometry.js";
import { updateInfoText, initInfoText, initPIXI } from "./utils.js";
import { Tree } from "../tree/tree.js";
import { TreeNode } from "../tree/tree_node.js";

const app = initPIXI();
const infoText = initInfoText();
const inputTreeTopology = document.getElementById("inputTreeTopology");
const inputNumFragments = document.getElementById("inputNumFragments");
const inputNumNodes = document.getElementById("inputNumNodes");


const window_width = window.innerWidth;
const window_height = window.innerHeight;
const SHORTER_WINDOW_DIMENSION = Math.min(window_width / 2, window_height / 2);


function duplicateTreeNTimes(tree, N) {
  // Create a new root node
  const newRoot = new TreeNode();

  // Function to deep clone a tree node
  function cloneNode(node) {
    const newNode = new TreeNode(null, []);
    newNode.label = node.label;
    newNode.numDescendants = node.numDescendants;
    newNode.weight = node.weight;

    for (const child of node.children) {
      const newChild = cloneNode(child);
      newChild.father = newNode;
      newNode.children.push(newChild);
    }

    return newNode;
  }

  // Duplicate the original tree N times and add to the new root
  for (let i = 0; i < N; i++) {
    // Clone tree
    const clonedTree = cloneNode(tree.root);

    // Add an intermediate node to make a 2-tower
    const frameNode = new TreeNode(newRoot, [clonedTree]);
    clonedTree.father = frameNode;
    newRoot.children.push(frameNode);
  }

  // Initialize the new tree
  const newTree = new Tree(newRoot);
  newTree.initialize_nodes(newRoot, "X", 0);
  newTree.compute_weights(1);

  return newTree;
}

function generateRandomTree(N) {
  if (N <= 0) return null;

  // Helper function to create a tree node
  function createNode(father = null) {
    return new TreeNode(father, []);
  }

  // Create the root node
  const root = createNode();
  let nodes = [root];
  for (let n = 0; n < N; n++) {
    // pick a random node, add a child. 
    // This over-represents lower-level nodes, leading to trees that are wider
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const newNode = createNode(node);
    node.children.push(newNode);
    nodes.push(newNode);
  }

  // Initialize the tree
  const tree = new Tree(root);
  tree.initialize_nodes(root, "X", 0);
  tree.compute_weights(1);

  return tree;
}

function polygonView() {

  let current_tree = Tree.fromString(inputTreeTopology.value)
  if (!current_tree) {
    inputTreeTopology.value = generateRandomTree(inputNumNodes.value).toString();
    current_tree = Tree.fromString(inputTreeTopology.value)
    if (!current_tree) {
      throw `current tree cannot be null after the tree was generated`;
    }
  }

  clearDrawing();
  current_tree = duplicateTreeNTimes(current_tree, inputNumFragments.value);

  let infoSuffix = ``;

  const window_width = window.innerWidth;
  const window_height = window.innerHeight;

  const shorter = Math.min(window_width / 2, window_height / 2);
  let polygon = circlePolygon(
    new PIXI.Vec(window_width / 2, window_height / 2),
    shorter * 0.7,
    SHAPES[current_shape][0],
    SHAPES[current_shape][1],
    SHAPES[current_shape][2]
  );

  // Try to draw for a certain max number of times
  const MAX_TRIES = 400;
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
}

let SHAPES = [
  // [num_edges, scale, rotation_deg]
  [4, new PIXI.Vec(1, 1), 45],
  [4, new PIXI.Vec(1, 1), 0],
  [4, new PIXI.Vec(1.5, 0.7), 45],
  [4, new PIXI.Vec(0.7, 1.5), 45],
  [8, new PIXI.Vec(1, 1), 0],
  [50, new PIXI.Vec(1, 1), 0],
  [3, new PIXI.Vec(1, 1), 0],
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
    debounce(polygonView, 100);
  }
  if (event.key == " ") {
    debounce(polygonView, 100);
  }
});

polygonView();

inputTreeTopology.addEventListener("input", () => debounce(polygonView, 100));
inputNumFragments.addEventListener("input", () => debounce(polygonView, 100));
inputNumNodes.addEventListener("input", () => {
  inputTreeTopology.value = ""
  debounce(polygonView, 100);
});
window.onresize = function () {
  debounce(polygonView, 50);
};

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
function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;
  let file = files[0];

  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    let texture = PIXI.Texture.from(reader.result);
    let sprite = new PIXI.Sprite(texture);

    sprite.width = SHORTER_WINDOW_DIMENSION;
    sprite.height = SHORTER_WINDOW_DIMENSION;
    sprite.x = app.screen.width / 2;
    sprite.y = app.screen.height / 2;
    sprite.anchor.set(0.5);
    app.stage.addChild(sprite);

    // Create another texture with only the transparent points colored red
    let baseTexture = texture.baseTexture;
    let resource = baseTexture.resource;
    let image = new Image();
    image.src = resource.url;

    image.onload = () => {
      let canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      let context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);

      let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      // Function to get the pixel index
      function getPixelIndex(x, y) {
        return (y * canvas.width + x) * 4;
      }

      // Function to close small islands
      function closeSmallIslands() {
        let visited = new Uint8Array(canvas.width * canvas.height);
        let threshold = (canvas.width * canvas.height) * 0.01; // 1% of the image
        let islands = [];

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            let idx = getPixelIndex(x, y);
            if (data[idx + 3] !== 0 && !visited[y * canvas.width + x]) {
              let queue = [[x, y]];
              let island = [];

              while (queue.length > 0) {
                let [qx, qy] = queue.pop();
                let qIdx = getPixelIndex(qx, qy);

                if (qx < 0 || qx >= canvas.width || qy < 0 || qy >= canvas.height) continue;
                if (data[qIdx + 3] === 0 || visited[qy * canvas.width + qx]) continue;

                visited[qy * canvas.width + qx] = 1;
                island.push([qx, qy]);

                queue.push([qx - 1, qy]);
                queue.push([qx + 1, qy]);
                queue.push([qx, qy - 1]);
                queue.push([qx, qy + 1]);
              }

              if (island.length < threshold) {
                islands.push(island);
              }
            }
          }
        }

        for (let island of islands) {
          for (let [ix, iy] of island) {
            let idx = getPixelIndex(ix, iy);
            data[idx + 3] = 0; // Make the pixel fully transparent
          }
        }
      }

      closeSmallIslands();

      // Function to compute contours
      function computeContours() {
        let contours = [];
        let visited = new Uint8Array(canvas.width * canvas.height);

        let directions = [
          [-1, -1], [0, -1], [1, -1],
          [-1, 0], [1, 0],
          [-1, 1], [0, 1], [1, 1]
        ];

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            let idx = getPixelIndex(x, y);
            if (data[idx + 3] !== 0 && !visited[y * canvas.width + x]) {
              let contour = [];
              let stack = [[x, y]];

              while (stack.length > 0) {
                let [cx, cy] = stack.pop();
                let cIdx = getPixelIndex(cx, cy);

                if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
                if (visited[cy * canvas.width + cx]) continue;

                visited[cy * canvas.width + cx] = 1;
                contour.push([cx, cy]);

                for (let [dx, dy] of directions) {
                  let nx = cx + dx;
                  let ny = cy + dy;
                  let nIdx = getPixelIndex(nx, ny);

                  if (nx < 0 || nx >= canvas.width || ny < 0 || ny >= canvas.height) continue;
                  if (data[nIdx + 3] !== 0 && !visited[ny * canvas.width + nx]) {
                    stack.push([nx, ny]);
                  }
                }
              }

              contours.push(contour);
            }
          }
        }

        return contours;
      }

      let contours = computeContours();
      for (let i = 0; i < contours.length; i += 10000) {
        let contour = contours[i];
        for (let j = 0; j < contour.length; j++) {
          let [x, y] = contour[j];

          // Draw a circle at each contour point
          let circle = new PIXI.Graphics();
          circle.beginFill(0xFF0000); // Red color
          circle.drawCircle(0, 0, 2); // Radius of 2 pixels
          circle.endFill();
          circle.x = x;
          circle.y = y;
          app.stage.addChild(circle);
        }
      }
      console.log(contours); // Output the contours

      for (let i = 0; i < data.length; i += 4) {
        let alpha = data[i + 3];
        if (alpha === 0) {
          data[i] = 255;   // Red
          data[i + 1] = 0; // Green
          data[i + 2] = 0; // Blue
          data[i + 3] = 255; // Fully opaque
        } else {
          // Make other pixels fully transparent
          data[i + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);

      let newTexture = PIXI.Texture.from(canvas);
      let newSprite = new PIXI.Sprite(newTexture);

      newSprite.width = SHORTER_WINDOW_DIMENSION;
      newSprite.height = SHORTER_WINDOW_DIMENSION;
      newSprite.x = app.screen.width / 2;
      newSprite.y = app.screen.height / 2;
      newSprite.anchor.set(0.5);
      app.stage.addChild(newSprite);
    }
  }
}