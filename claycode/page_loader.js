
// Load header
async function fetchHtmlAsText(url) { return await (await fetch(url)).text(); }
const contentDiv = document.getElementById("headerDiv");
contentDiv.innerHTML = await fetchHtmlAsText("/pages/header.html");
