import {} from "../geometry/vector.js";
import {} from "../geometry/math.js";
import { textToTree, getDescription } from "../conversion/convert.js";
import * as utils from "./utils.js";

let CLAYCODE_FILE_PREFIX = "claycode_sample___"
let SAMPLES = [
    ["Hi", 0],
    ["Hi", 1],
    ["Hi", 2],
    ["Hi", 3],
    ["Hi", 4],
    ["Hello world!", 1],
    ["Hello world!", 2],
    ["Is the proof inductive or coinductive?", 2],
    ["www.maida.me", 1],
    ["maps.app.goo.gl/aCCv21W1xx15Qxp18", 0],
    ["maps.app.goo.gl/aCCv21W1xx15Qxp18", 1],
    //["open.spotify.com/track/0T5iIrXA4p5GsubkhuBIKV?si=9aa280042e824513", 1] // Currently too long :(
]

// Given a blob, saves it with the given file name
function downloadBlob(blob, fileName) {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName
    
    // Trigger the download
    document.body.appendChild(link);  // Append the link to the document body (required for Firefox)
    link.click();
    document.body.removeChild(link); // Remove the link from the document
    URL.revokeObjectURL(link.href); // Release the blob URL
}

// Save the metadata file
function saveMetadata() {
    var jsonStr = JSON.stringify({
        encoding_metadata: getDescription(),
        samples: SAMPLES
    }, null, 2);

    console.log(jsonStr)

    // Save metadata JSON in folder
    var blob = new Blob([jsonStr], { type: "application/json" });
    downloadBlob(blob, `${CLAYCODE_FILE_PREFIX}metadata.json`)
}

function renderClaycode(inputText, shape) {
  console.log(`Rendering ${inputText} with shape: ${shape}`)
  const current_tree = textToTree(inputText);
  const polygon_center = new PIXI.Vec(
    window.innerWidth  / 2,
    window.innerHeight / 2
  );
  const polygon_size =
    Math.min(window.innerWidth / 2, window.innerHeight / 2) * 0.95;
  const success = utils.drawPolygonClaycode(
    current_tree,
    shape,
    polygon_center,
    polygon_size
  );
}

function captureAndSaveImage(index) {
    const image = app.renderer.plugins.extract.canvas(app.stage.children[0]);

    image.toBlob((blob) => {
        downloadBlob(blob, `${CLAYCODE_FILE_PREFIX}${index}.png`)
      }, 'image/png');  
}

const app = utils.initPIXI();
for (let [index, sample] of SAMPLES.entries()) {
    // Without a timeout, there is no feedback, and sometimes it breaks (maybe too many downloads)
    await new Promise(resolve => setTimeout(resolve, 50)) 
    let inputText = sample[0]
    let shape = sample[1]
    renderClaycode(inputText, shape);
    captureAndSaveImage(index);
}

console.log("Produced all Claycodes. Saving metadata...")
saveMetadata()
// Wait before closing the page, to avoid the last file not being produced
await new Promise(resolve => setTimeout(resolve, 500)) 
close()