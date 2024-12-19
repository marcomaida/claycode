import {} from "../geometry/vector.js";
import {} from "../geometry/math.js";
import { textToTree } from "../conversion/convert.js";
import * as utils from "./utils.js";

// Setup
await utils.showChangeShapeLabel(true);
const pixiDiv = document.getElementById("pixiDiv"); // Use existing PIXI div
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000,
});
pixiDiv.appendChild(app.view);
utils.initInfoText();

// Constants
const BARCODE_WIDTH = 200;
const BARCODE_HEIGHT = 200;
const GRID_SIZE = 10; // Grid resolution for mesh distortion
const BLOCK_SIZE = 30;

// State Variables
let showRedBox = true;
let distortionAmount = 0;
let animateAmount = 0;

// Create containers for barcodes
const barcode1Container = new PIXI.Container();
const barcode2Container = new PIXI.Container();
app.stage.addChild(barcode1Container, barcode2Container);

// Resize and center stage
function centerBarcodes() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    barcode1Container.x = centerX - BARCODE_WIDTH - 40;
    barcode1Container.y = centerY - BARCODE_HEIGHT / 2;
    barcode2Container.x = centerX + 40;
    barcode2Container.y = centerY - BARCODE_HEIGHT / 2;
}

// Function to create mesh with distortion support
function createBarcodeMesh(url, container) {
    const texture = PIXI.Texture.from(url);
    const verticesX = GRID_SIZE + 1;
    const verticesY = GRID_SIZE + 1;
    const meshVertices = [];
    const indices = [];
    const uvs = [];
    const gridWidth = BARCODE_WIDTH / GRID_SIZE;
    const gridHeight = BARCODE_HEIGHT / GRID_SIZE;

    // Generate vertices, UVs, and indices
    for (let y = 0; y < verticesY; y++) {
        for (let x = 0; x < verticesX; x++) {
            meshVertices.push(x * gridWidth, y * gridHeight);
            uvs.push(x / GRID_SIZE, y / GRID_SIZE);
        }
    }

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const topLeft = y * verticesX + x;
            const topRight = topLeft + 1;
            const bottomLeft = topLeft + verticesX;
            const bottomRight = bottomLeft + 1;

            indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
        }
    }

    const mesh = new PIXI.SimpleMesh(texture, new Float32Array(meshVertices), new Float32Array(uvs), new Uint16Array(indices));
    mesh.width = BARCODE_WIDTH;
    mesh.height = BARCODE_HEIGHT;

    container.addChild(mesh);
    return mesh;
}

// Function to apply distortion based on random pulling (static)
function applyDistortion(mesh) {
    const vertices = mesh.vertices;
    for (let i = 0; i < vertices.length; i += 2) {
        vertices[i] = mesh.originalVertices[i] + (Math.random() - 0.5) * distortionAmount; // X distortion
        vertices[i + 1] = mesh.originalVertices[i + 1] + (Math.random() - 0.5) * distortionAmount; // Y distortion
    }
    mesh.vertices = new Float32Array(vertices);
}

// Function to apply moving wave distortion
function applyWaveAnimation(mesh) {
    const vertices = mesh.vertices.slice(); // Clone vertices to avoid overwriting
    const time = Date.now() * 0.002; // Use time for animation
    for (let i = 0; i < vertices.length; i += 2) {
        const baseX = mesh.originalVertices[i];
        const baseY = mesh.originalVertices[i + 1];

        const waveX = Math.sin(baseY * 0.05 + time) * animateAmount;
        const waveY = Math.cos(baseX * 0.05 + time) * animateAmount;

        vertices[i] = baseX + waveX;
        vertices[i + 1] = baseY + waveY;
    }
    mesh.vertices = new Float32Array(vertices);
}

// Load barcodes as meshes
const barcode1Url = "/images/qr.png";
const barcode2Url = "/images/bar-code.webp";
const barcode1Mesh = createBarcodeMesh(barcode1Url, barcode1Container);
const barcode2Mesh = createBarcodeMesh(barcode2Url, barcode2Container);

// Store original vertices
barcode1Mesh.originalVertices = barcode1Mesh.vertices.slice();
barcode2Mesh.originalVertices = barcode2Mesh.vertices.slice();

// Function to toggle obfuscation
function toggleObfuscation() {
    const addBlock = (container) => {
        const block = new PIXI.Graphics();
        block.beginFill(0xff0000, 0.5);
        block.drawRect(
            Math.random() * (BARCODE_WIDTH - BLOCK_SIZE),
            Math.random() * (BARCODE_HEIGHT - BLOCK_SIZE),
            BLOCK_SIZE,
            BLOCK_SIZE
        );
        block.endFill();
        container.addChild(block);
    };

    barcode1Container.removeChildren(1);
    barcode2Container.removeChildren(1);

    if (showRedBox) {
        addBlock(barcode1Container);
        addBlock(barcode2Container);
    }
}

// Center the barcodes initially
centerBarcodes();
window.addEventListener("resize", centerBarcodes);

// Connect slider for distortion
const distortSlider = document.getElementById("distortionSlider");
distortSlider.addEventListener("input", (e) => {
    distortionAmount = e.target.value / 5; // Adjust slider scale
    applyDistortion(barcode1Mesh);
    applyDistortion(barcode2Mesh);
});

// Connect slider for animate distortion
const animateSlider = document.getElementById("animateSlider");
animateSlider.addEventListener("input", (e) => {
    animateAmount = e.target.value / 5; // Adjust slider scale
});

// Animate wave distortion
app.ticker.add(() => {
    if (animateAmount > 0) {
        applyWaveAnimation(barcode1Mesh);
        applyWaveAnimation(barcode2Mesh);
    }
});
