import { textToBits } from "../conversion/convert.js";
import { clearDrawing, initDrawing } from "../packer/draw.js";

export function initPIXI() {
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: 1,
        antialias: true,
    });
    initDrawing(app);

    document.body.appendChild(app.view);

    return app;
}

export function initInputText() {
    const inputTextBox = document.getElementById("inputText");
    inputTextBox.select();
    inputTextBox.focus();
    return inputTextBox;
}

export function initInfoText() {
    const infoText = document.getElementById("infoText");
    infoText.textContent = "";
    return infoText;
}

export function updateInfoText(inputText, currentTree, infoSuffix = '') {
    const infoText = document.getElementById("infoText");
    infoText.textContent = `${inputText.length} Chars | ${currentTree.root.numDescendants} Nodes | ${textToBits(inputText).length} bits ` + infoSuffix;
}
