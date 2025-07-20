// Load header
async function fetchHtmlAsText(url) {
  return await (await fetch(url)).text();
}

const headerDiv = document.getElementById("headerDiv");
headerDiv.innerHTML = await fetchHtmlAsText("/pages/header.html");

// Highlight the current page in the header
const currentPath = window.location.pathname;
const headerLinks = headerDiv.querySelectorAll('.header-nav a');
headerLinks.forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('header-element');
  }
});

const footerDiv = document.getElementById("footerDiv");
if (footerDiv !== null) { footerDiv.innerHTML = await fetchHtmlAsText("/pages/footer.html"); }
