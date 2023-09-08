import { } from "./pixi.mini.js";

async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}

const contentDiv = document.getElementById("headerDiv");
contentDiv.innerHTML = await fetchHtmlAsText("page_header.html");


import { } from "./scenes/scene_polygon.js";
// import {} from "./scenes/scene_static_double.js"
// import {} from "./scenes/scene_shape_shift.js"
// import {} from "./scenes/scene_test.js";
