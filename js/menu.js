const menuButton = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const brand = document.querySelector(".brand");
let closeMenuTimer;
const gameLink = document.createElement("a");

gameLink.href = window.location.pathname.includes("/pro/html/")
  ? "../../juego/index.html"
  : "../juego/index.html";
gameLink.textContent = "🎮 Shadow Maze";
gameLink.dataset.menuLink = "";
siteMenu.append(gameLink);

const brandStyles = [
  { family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { family: "Arial, Helvetica, sans-serif" },
  { family: "Georgia, serif" },
  { family: "Consolas, Monaco, monospace" },
  { family: "'Trebuchet MS', sans-serif" },
  { family: "'Comic Sans MS', 'Comic Sans', cursive" },
  { family: "'MS Gothic', 'ＭＳ ゴシック', sans-serif" },
  { family: "'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif" },
  { family: "system-ui, sans-serif", extruded: true },
];

function shuffledStyles(styles) {
  const shuffled = [...styles];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function createStyleOrder(firstStyle) {
  const remainingStyles = brandStyles.filter((style) => style !== firstStyle);
  return [firstStyle, ...shuffledStyles(remainingStyles)];
}

function applyBrandStyle(style) {
  brand.style.fontFamily = style.family;
  brand.classList.toggle("brand--extruded", Boolean(style.extruded));
}

let styleOrder = shuffledStyles(brandStyles);
let styleIndex = 0;
applyBrandStyle(styleOrder[styleIndex]);

brand.addEventListener("click", () => {
  const availableStyles = brandStyles.filter((style) => style !== styleOrder[styleIndex]);
  const nextStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
  styleOrder = createStyleOrder(nextStyle);
  styleIndex = 0;
  applyBrandStyle(nextStyle);
});

window.setInterval(() => {
  styleIndex += 1;

  if (styleIndex === styleOrder.length) {
    styleOrder = createStyleOrder(styleOrder[styleIndex - 1]);
    styleIndex = 0;
  }

  applyBrandStyle(styleOrder[styleIndex]);
}, 15 * 60 * 1000);

function closeMenu() {
  window.clearTimeout(closeMenuTimer);
  siteMenu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
}

function scheduleMenuClose() {
  window.clearTimeout(closeMenuTimer);

  if (!siteMenu.hidden && !siteMenu.matches(":hover")) {
    closeMenuTimer = window.setTimeout(closeMenu, 5000);
  }
}

menuButton.addEventListener("click", () => {
  if (!siteMenu.hidden) {
    closeMenu();
    return;
  }

  siteMenu.hidden = false;
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Cerrar menú");
  scheduleMenuClose();
});

siteMenu.addEventListener("mouseenter", () => {
  window.clearTimeout(closeMenuTimer);
});

siteMenu.addEventListener("mouseleave", scheduleMenuClose);

siteMenu.addEventListener("click", (event) => {
  if (event.target.closest("[data-menu-link]")) {
    closeMenu();
  }
});

document.addEventListener("click", (event) => {
  if (!siteMenu.hidden && !siteMenu.contains(event.target) && !menuButton.contains(event.target)) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});
