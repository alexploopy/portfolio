// Make the obfuscated email clickable WITHOUT ever putting the real address in
// the page source. The visible text stays "you[dot]name[at]example[dot]com";
// the real mailto is reconstructed in memory only when a human clicks/activates
// it, so scrapers (which read the HTML/DOM but don't click) never see it.
(function () {
  var el = document.querySelector(".email");
  if (!el) return;

  function reveal() {
    var src = (el.getAttribute("data-email") || el.textContent).trim();
    var addr = src.replace(/\[dot\]/g, ".").replace(/\[at\]/g, "@");
    window.location.href = "mailto:" + addr;
  }

  el.classList.add("is-clickable");
  el.setAttribute("role", "link");
  el.setAttribute("tabindex", "0");
  el.setAttribute("title", "Email me");
  el.addEventListener("click", reveal);
  el.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      reveal();
    }
  });
})();
