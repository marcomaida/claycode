// Load header
async function fetchHtmlAsText(url) {
  return await (await fetch(url)).text();
}

const headerDiv = document.getElementById("headerDiv");
headerDiv.innerHTML = await fetchHtmlAsText("/pages/header.html");

const footerDiv = document.getElementById("footerDiv");
if (footerDiv !== null) { footerDiv.innerHTML = await fetchHtmlAsText("/pages/footer.html"); }
