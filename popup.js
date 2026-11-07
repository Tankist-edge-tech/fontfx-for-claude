const $ = (id) => document.getElementById(id);
const FX = ["fxGlitch", "fxGrid", "fxScan", "fxSharp", "fxMotion", "themeFonts", "ambientFocus", "ambientClearInput"];

let settings = { ...CX.DEFAULTS };
let allFonts = [];

function getFonts() {
  return new Promise((resolve) => {
    if (chrome.fontSettings && chrome.fontSettings.getFontList) {
      chrome.fontSettings.getFontList((list) =>
        resolve(list.map((f) => f.fontId).sort((a, b) => a.localeCompare(b))));
    } else {
      resolve(["Arial", "Georgia", "Segoe UI", "Verdana", "Times New Roman", "Consolas", "Courier New"]);
    }
  });
}

function option(value, label) {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = label;
  if (value) o.style.fontFamily = `"${value}"`;
  return o;
}

const themed = () => settings.base !== "off";
const usingThemeFonts = () => themed() && settings.themeFonts;

function fillFontList(filter = "") {
  const sel = $("font");
  sel.innerHTML = "";
  sel.appendChild(option("", usingThemeFonts() ? "Theme font (Chakra Petch)" : "Claude's default"));
  const f = filter.trim().toLowerCase();
  allFonts.filter((n) => !f || n.toLowerCase().includes(f)).forEach((n) => sel.appendChild(option(n, n)));
  sel.value = settings.font;
  if (sel.value !== settings.font) sel.selectedIndex = -1;
}

function fillCodeList() {
  const sel = $("codeFont");
  sel.innerHTML = "";
  sel.appendChild(option("", usingThemeFonts() ? "Theme font (Share Tech Mono)" : "Claude's default"));
  const mono = /mono|code|consol|courier|menlo|fira|cascadia|jetbrains|hack|inconsolata|source code|lucida console/i;
  const g1 = document.createElement("optgroup"); g1.label = "Monospace";
  const g2 = document.createElement("optgroup"); g2.label = "Other fonts";
  allFonts.forEach((n) => (mono.test(n) ? g1 : g2).appendChild(option(n, n)));
  if (g1.children.length) sel.appendChild(g1);
  sel.appendChild(g2);
  sel.value = settings.codeFont;
}

function buildPalettes() {
  const box = $("palettes");
  const base = CX.baseFor(settings) || CX.BASES.dark;
  box.innerHTML = "";
  const entries = Object.entries(CX.PALETTES).concat([["custom", { name: "Custom" }]]);
  for (const [key, p] of entries) {
    const btn = document.createElement("button");
    btn.dataset.palette = key;
    const sw = document.createElement("span");
    sw.className = "sw";
    const c = CX.colors({ ...settings, palette: key });
    sw.style.setProperty("--a", c.hexA);
    sw.style.setProperty("--b", c.hexB);
    if (key === "custom") sw.classList.add("sw-custom");
    if (key === "mono") sw.style.setProperty("--a", base.light ? "#111" : "#f2f2f2");
    btn.append(sw, p.name);
    btn.addEventListener("click", () => save({ palette: key }));
    box.appendChild(btn);
  }
}

function render() {
  // the popup is always dark, so use the bright versions of the colors
  const pc = CX.colors({ ...settings, base: "dark", palette: themed() ? settings.palette : "neon" });
  document.documentElement.style.setProperty("--a", themed() ? pc.hexA : "#d97757");
  document.documentElement.style.setProperty("--b", themed() ? pc.hexB : "#7aa7ff");

  $("enabled").checked = settings.enabled;
  $("controls").classList.toggle("off", !settings.enabled);
  document.querySelectorAll("#bases button").forEach((b) => b.classList.toggle("on", b.dataset.base === settings.base));
  document.querySelectorAll(".themeOnly").forEach((el) => el.classList.toggle("off", !themed()));
  $("effectsHint").style.display = themed() ? "none" : "";
  $("customBgBox").classList.toggle("show", settings.base === "custom");
  $("customBg").value = settings.customBg;
  $("customBgSw").style.background = settings.customBg;
  const cb = CX.baseFor({ ...settings, base: "custom" });
  $("customBgNote").textContent = cb.light ? "light → dark text" : "dark → light text";

  buildPalettes();
  document.querySelectorAll("#palettes button").forEach((b) => b.classList.toggle("on", b.dataset.palette === settings.palette));
  $("customBox").classList.toggle("show", settings.palette === "custom");
  $("customA").value = settings.customA;
  $("customB").value = settings.customB;

  FX.forEach((k) => ($(k).checked = !!settings[k]));
  document.querySelectorAll("#glitchSpeed button").forEach((b) => b.classList.toggle("on", b.dataset.v === settings.glitchSpeed));
  document.querySelectorAll("#ambient button").forEach((b) => b.classList.toggle("on", b.dataset.v === settings.ambient));
  $("ambientBox").classList.toggle("off", settings.ambient === "off");
  $("ambientLevel").value = settings.ambientLevel;
  $("ambientLevelOut").textContent = `${settings.ambientLevel}%`;
  $("ambientSpeed").value = settings.ambientSpeed;
  $("ambientSpeedOut").textContent = `${Number(settings.ambientSpeed).toFixed(2).replace(/0$/, "")}×`;

  $("size").value = settings.size;
  $("sizeOut").textContent = `${settings.size}%`;
  $("lineHeight").value = settings.lineHeight;
  $("lineOut").textContent = Number(settings.lineHeight) > 0 ? Number(settings.lineHeight).toFixed(1) : "default";

  const p = $("preview");
  p.style.fontFamily = settings.font ? `"${settings.font}", system-ui, sans-serif`
    : (usingThemeFonts() ? '"CX Text", system-ui, sans-serif' : "system-ui, sans-serif");
  p.style.fontSize = `${14 * settings.size / 100}px`;
  p.style.lineHeight = Number(settings.lineHeight) > 0 ? settings.lineHeight : "";
  p.querySelector("code").style.fontFamily = settings.codeFont ? `"${settings.codeFont}", monospace`
    : (usingThemeFonts() ? '"CX Mono", monospace' : "ui-monospace, monospace");
}

let saveTimer = null;
function save(patch, { relist = false } = {}) {
  settings = { ...settings, ...patch };
  clearTimeout(saveTimer);                       // color pickers fire fast; don't flood storage
  saveTimer = setTimeout(() => chrome.storage.sync.set(settings), 60);
  render();
  if (relist) { fillFontList($("fontFilter").value); fillCodeList(); }
}

function showTab(name) {
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === name));
  document.querySelectorAll(".pane").forEach((p) => p.classList.toggle("show", p.dataset.pane === name));
  try { localStorage.setItem("cx-tab", name); } catch (e) {}
}

(async () => {
  let tab = "theme";
  try { tab = localStorage.getItem("cx-tab") || "theme"; } catch (e) {}
  showTab(tab);
  document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  const raw = await chrome.storage.sync.get(null);
  settings = CX.migrate(raw);
  if (raw.theme !== undefined) { await chrome.storage.sync.remove("theme"); chrome.storage.sync.set(settings); }
  allFonts = await getFonts();
  fillFontList();
  fillCodeList();
  render();

  $("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }));
  document.querySelectorAll("#bases button").forEach((b) =>
    b.addEventListener("click", () => save({ base: b.dataset.base }, { relist: true })));
  $("customBg").addEventListener("input", (e) => save({ customBg: e.target.value, base: "custom" }, { relist: settings.base !== "custom" }));
  $("customA").addEventListener("input", (e) => save({ customA: e.target.value, palette: "custom" }));
  $("customB").addEventListener("input", (e) => save({ customB: e.target.value, palette: "custom" }));
  $("swap").addEventListener("click", () => save({ customA: settings.customB, customB: settings.customA }));
  FX.forEach((k) => $(k).addEventListener("change", (e) =>
    save({ [k]: e.target.checked }, { relist: k === "themeFonts" })));
  document.querySelectorAll("#glitchSpeed button").forEach((b) =>
    b.addEventListener("click", () => save({ glitchSpeed: b.dataset.v })));
  document.querySelectorAll("#ambient button").forEach((b) =>
    b.addEventListener("click", () => save({ ambient: b.dataset.v })));
  $("ambientLevel").addEventListener("input", (e) => save({ ambientLevel: Number(e.target.value) }));
  $("ambientSpeed").addEventListener("input", (e) => save({ ambientSpeed: Number(e.target.value) }));

  $("fontFilter").addEventListener("input", (e) => fillFontList(e.target.value));
  $("font").addEventListener("change", (e) => save({ font: e.target.value }));
  $("codeFont").addEventListener("change", (e) => save({ codeFont: e.target.value }));
  $("size").addEventListener("input", (e) => save({ size: Number(e.target.value) }));
  $("lineHeight").addEventListener("input", (e) => save({ lineHeight: Number(e.target.value) }));
  $("reset").addEventListener("click", () => {
    $("fontFilter").value = "";
    save({ ...CX.DEFAULTS }, { relist: true });
  });
})();
