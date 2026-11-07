// Applies fonts, the theme and the ambient background to claude.ai; updates live.
(() => {
  const STYLE_ID = "claude-font-changer-style";
  const SPEEDS = { calm: "8s", normal: "4s", wild: "1.3s" };
  const root = document.documentElement;
  const quote = (name) => `"${String(name).replace(/["\\]/g, "")}"`;
  let settings = { ...CX.DEFAULTS };

  // ---------------------------------------------------------------- fonts
  let fontsLoaded = false;
  async function loadThemeFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
    const LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
    const faces = [
      ["CX Text", "chakra-petch-latin-300-normal", "300", LATIN],
      ["CX Text", "chakra-petch-latin-ext-300-normal", "300", LATIN_EXT],
      ["CX Text", "chakra-petch-latin-400-normal", "400", LATIN],
      ["CX Text", "chakra-petch-latin-ext-400-normal", "400", LATIN_EXT],
      ["CX Text", "chakra-petch-latin-600-normal", "500 700", LATIN],
      ["CX Text", "chakra-petch-latin-ext-600-normal", "500 700", LATIN_EXT],
      ["CX Display", "orbitron-latin-500-normal", "400 500", LATIN],
      ["CX Display", "orbitron-latin-700-normal", "600 700", LATIN],
      ["CX Display", "orbitron-latin-900-normal", "800 900", LATIN],
      ["CX Mono", "share-tech-mono-latin-400-normal", "100 900", LATIN]
    ];
    await Promise.all(faces.map(async ([family, file, weight, range]) => {
      try {
        const buf = await (await fetch(chrome.runtime.getURL(`fonts/${file}.woff2`))).arrayBuffer();
        const face = new FontFace(family, buf, { weight, unicodeRange: range, display: "swap" });
        await face.load();
        document.fonts.add(face);
      } catch (e) { /* system fonts are used instead */ }
    }));
  }

  function buildFontCss(s) {
    if (!s.enabled) return "";
    let css = "";
    if (s.size && Number(s.size) !== 100) css += `html { font-size: ${Number(s.size)}% !important; }\n`;
    if (s.font) {
      const stack = `${quote(s.font)}, system-ui, sans-serif`;
      css += `
body, body *:not(pre):not(code):not(kbd):not(samp)
  :not(pre *):not(code *):not(.katex):not(.katex *) { font-family: ${stack} !important; }
input, textarea, button, select, [contenteditable="true"], [contenteditable="true"] * { font-family: ${stack} !important; }\n`;
    }
    if (s.codeFont) {
      css += `pre, code, kbd, samp, pre *, code * { font-family: ${quote(s.codeFont)}, ui-monospace, monospace !important; }\n`;
    }
    if (s.lineHeight && Number(s.lineHeight) > 0) {
      css += `body p, body li, body blockquote, [contenteditable="true"] p { line-height: ${Number(s.lineHeight)} !important; }\n`;
    }
    return css;
  }

  let fontCss = "";
  function ensureStyle() {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      (document.head || root).appendChild(el);
    }
    if (el.textContent !== fontCss) el.textContent = fontCss;
    if (document.head && el.parentNode && el.parentNode.lastElementChild !== el) document.head.appendChild(el);
  }

  // ---------------------------------------------------------------- theme
  const VAR_KEYS = ["sf0", "sf1", "sf2", "sf3", "pop", "bg", "bg2", "code", "s0", "s1", "s2", "s3", "line", "t0", "t1", "t2", "t3", "t4", "t5", "bd1", "bd2", "bd3", "bd4"];
  function themeOn(s) { return !!(s.enabled && CX.baseFor(s)); }

  function applyTheme(s) {
    const on = themeOn(s);
    const base = CX.baseFor(s);
    const cls = {
      "cx-on": on,
      "cx-light": on && base.light,
      "cx-tfonts": on && s.themeFonts,
      "cx-userfont": s.enabled && !!s.font,
      "cx-usercode": s.enabled && !!s.codeFont,
      "cx-grid": on && s.fxGrid,
      "cx-scan": on && s.fxScan,
      "cx-glitch": on && s.fxGlitch,
      "cx-sharp": on && s.fxSharp,
      "cx-motion": on && s.fxMotion
    };
    for (const [c, v] of Object.entries(cls)) root.classList.toggle(c, !!v);

    if (on) {
      const c = CX.colors(s);
      VAR_KEYS.forEach((k) => root.style.setProperty(`--cx-${k}`, base[k]));
      root.style.setProperty("--cx-glow", base.glow);
      root.style.setProperty("--cx-scan", base.scan);
      root.style.setProperty("--cx-a", c.a);
      root.style.setProperty("--cx-b", c.b);
      root.style.setProperty("--cx-ai", c.ai);
      root.style.setProperty("--cx-bi", c.bi);
      root.style.setProperty("--cx-on", c.on);
      root.style.setProperty("--cx-gspeed", SPEEDS[s.glitchSpeed] || "4s");
      loadThemeFonts(); // labels use the mono font even when theme fonts are off
      scheduleTag();
    } else {
      [...root.style].filter((p) => p.startsWith("--cx-")).forEach((p) => root.style.removeProperty(p));
    }
    Ambient.update(s);
  }

  // Copy heading text into data-cx so the glitch layers can show it.
  const HEADINGS = "main h1, div.font-ui-serif.text-center > span.select-none, .font-claude-response :is(h1,h2,h3), .font-claude-message :is(h1,h2,h3), .standard-markdown :is(h1,h2,h3), .prose :is(h1,h2,h3)";
  let tagQueued = false, started = false;
  function scheduleTag() {
    if (!started || tagQueued || !root.classList.contains("cx-glitch")) return;
    tagQueued = true;
    setTimeout(() => {
      tagQueued = false;
      document.querySelectorAll(HEADINGS).forEach((h) => {
        const t = h.textContent.trim();
        if (t && h.getAttribute("data-cx") !== t) h.setAttribute("data-cx", t);
      });
    }, 250);
  }

  // ---------------------------------------------------------------- ambient background
  const Ambient = (() => {
    let canvas = null, ctx = null, raf = null;
    let mode = "off", speed = 1, still = false, colA = [255, 46, 136], colB = [0, 240, 255];
    let scale = 1, w = 0, h = 0, last = 0, simT = 0, particles = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;
    const mix = (p, q, t) => p.map((v, i) => Math.round(v + (q[i] - v) * t));

    function ensureCanvas() {
      if (canvas) return;
      canvas = document.createElement("canvas");
      canvas.id = "cx-ambient";
      canvas.setAttribute("aria-hidden", "true");
      root.appendChild(canvas);
      ctx = canvas.getContext("2d");
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", wake);
    }
    function removeCanvas() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (canvas) canvas.remove();
      canvas = ctx = null;
      clearInterval(maskTimer); maskTimer = null; lastMask = "";
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", wake);
    }
    function resize() {
      if (!canvas) return;
      // soft modes are drawn small and scaled up by the browser (cheap and naturally blurry)
      scale = (mode === "aurora" || mode === "breathe") ? 0.2 : Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.width = Math.max(1, Math.ceil(innerWidth * scale));
      h = canvas.height = Math.max(1, Math.ceil(innerHeight * scale));
      if (mode === "particles") seedParticles();
      if (still) draw(simT);
    }
    function seedParticles() {
      const n = Math.round(Math.min(140, (innerWidth * innerHeight) / 16000));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (0.6 + Math.random() * 1.4) * scale,
        v: (5 + Math.random() * 12) * scale,
        p: Math.random() * Math.PI * 2,
        c: Math.random() < 0.6 ? 0 : 1
      }));
    }

    function drawAurora(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const blobs = [
        [colA, 0.05, 0.043, 0.0, 0.55], [colB, 0.037, 0.051, 2.1, 0.5],
        [mix(colA, colB, 0.5), 0.029, 0.033, 4.2, 0.45], [colA, 0.022, 0.027, 5.3, 0.35]
      ];
      const m = Math.max(w, h);
      blobs.forEach(([c, fx, fy, ph, a], i) => {
        const x = w * (0.5 + 0.42 * Math.sin(t * fx + ph));
        const y = h * (0.5 + 0.42 * Math.cos(t * fy + ph * 1.3));
        const r = m * (0.32 + 0.08 * Math.sin(t * 0.06 + i));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(c, a));
        g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      ctx.globalCompositeOperation = "source-over";
    }

    // 4 s in, 6 s out: about six slow breaths a minute
    function breath(t) {
      const c = t % 10;
      const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);
      return c < 4 ? ease(c / 4) : 1 - ease((c - 4) / 6);
    }
    function drawBreathe(t) {
      ctx.clearRect(0, 0, w, h);
      const v = breath(t);
      const cx = w / 2, cy = h / 2, d = Math.hypot(w, h) / 2;
      const g = ctx.createRadialGradient(cx, cy, d * (0.62 - 0.22 * v), cx, cy, d);
      g.addColorStop(0, rgba(colA, 0));
      g.addColorStop(0.55, rgba(mix(colA, colB, 0.35), 0.18 + 0.32 * v));
      g.addColorStop(1, rgba(colB, 0.35 + 0.45 * v));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    let lastSim = 0;
    function drawParticles(t) {
      const dt = Math.min(0.1, Math.max(0, t - lastSim));
      lastSim = t;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y -= p.v * dt;
        p.x += Math.sin(t * 0.25 + p.p) * 0.15 * scale;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.7 + p.p * 3));
        const c = p.c ? colB : colA;
        ctx.fillStyle = rgba(c, 0.12 * tw);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(c, 0.85 * tw);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawWaves(t) {
      ctx.clearRect(0, 0, w, h);
      const lines = 6, step = 10 * scale;
      for (let i = 0; i < lines; i++) {
        const k = i / (lines - 1);
        const baseY = h * (0.58 + k * 0.32);
        const amp = h * (0.025 + 0.02 * k);
        const f1 = (Math.PI * 2) / (w * (0.9 + 0.25 * k)), f2 = f1 * 2.3;
        const ph = t * (0.22 + 0.05 * i) + i * 0.9;
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const y = baseY + Math.sin(x * f1 + ph) * amp + Math.sin(x * f2 - ph * 0.7) * amp * 0.35;
          x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(mix(colA, colB, k), 0.55 - 0.05 * i);
        ctx.lineWidth = 1.3 * scale;
        ctx.stroke();
      }
    }

    // Clear areas: the reading column and/or the prompt box (found on the page).
    let focus = true, clearInput = false, maskTimer = null, lastMask = "";
    function promptRect() {
      const ed = document.querySelector('[data-testid="chat-input"], .ProseMirror[contenteditable="true"]');
      if (!ed) return null;
      const box = ed.closest("fieldset") || ed.closest('[class*="bg-surface-3"]') || ed;
      const r = box.getBoundingClientRect();
      return r.width > 0 && r.height > 0 ? r : null;
    }
    function updateMask() {
      if (!canvas) return;
      const layers = [];
      if (focus) layers.push("radial-gradient(ellipse 34% 48% at 50% 50%, transparent 0%, rgb(0 0 0 / 0.25) 55%, #000 100%)");
      if (clearInput) {
        const r = promptRect();
        if (r) {
          const rx = Math.round(r.width / 2 + 70), ry = Math.round(r.height / 2 + 60);
          const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
          layers.push(`radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, transparent 0%, transparent 62%, #000 100%)`);
        } else {
          layers.push("radial-gradient(ellipse 30% 14% at 50% 93%, transparent 0%, transparent 55%, #000 100%)");
        }
      }
      const mask = layers.join(", ") || "none";
      if (mask === lastMask) return;
      lastMask = mask;
      canvas.classList.remove("cx-focus");
      canvas.style.webkitMaskImage = canvas.style.maskImage = mask;
      const comp = layers.map(() => "intersect").join(", ");
      canvas.style.maskComposite = comp || "";
      canvas.style.webkitMaskComposite = layers.map(() => "source-in").join(", ");
    }

    function draw(t) {
      if (!ctx) return;
      ({ aurora: drawAurora, breathe: drawBreathe, particles: drawParticles, waves: drawWaves })[mode]?.(t);
    }

    function loop(now) {
      raf = null;
      if (!canvas || document.hidden) return;          // paused while the tab is hidden
      if (now - last >= 33) {                           // ~30 fps is plenty for slow motion
        const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
        last = now;
        simT += dt * speed;
        draw(simT);
      }
      if (!still) raf = requestAnimationFrame(loop);
    }
    function wake() {
      last = 0;
      if (canvas && !still && !raf && !document.hidden) raf = requestAnimationFrame(loop);
    }

    function update(s) {
      const want = themeOn(s) && s.ambient !== "off" ? s.ambient : "off";
      if (want === "off") { mode = "off"; removeCanvas(); return; }
      const c = CX.colors(s);
      colA = c.rgbA; colB = c.rgbB;
      speed = Math.max(0.1, Number(s.ambientSpeed) || 1);
      still = !s.fxMotion || reduceMotion.matches;
      const modeChanged = want !== mode;
      mode = want;
      if (!document.body) {                             // wait for the page to exist
        document.addEventListener("DOMContentLoaded", () => update(settings), { once: true });
        return;
      }
      ensureCanvas();
      // colors read much stronger on a light page, so soften them there
      const soften = (CX.baseFor(s) || {}).light ? 0.5 : 1;
      canvas.style.opacity = String(Math.max(0, Math.min(100, s.ambientLevel)) / 100 * soften);
      focus = !!s.ambientFocus;
      clearInput = !!s.ambientClearInput;
      updateMask();
      clearInterval(maskTimer);
      maskTimer = clearInput ? setInterval(updateMask, 1500) : null; // follow the prompt box if it moves
      window.removeEventListener("resize", updateMask);
      window.addEventListener("resize", updateMask);
      if (modeChanged || !w) { lastSim = simT; resize(); }
      if (simT === 0) simT = 20;                        // start mid-motion, not from a standstill
      draw(simT);
      wake();
    }

    return { update };
  })();

  // ---------------------------------------------------------------- wiring
  function apply(raw) {
    settings = CX.migrate(raw);
    fontCss = buildFontCss(settings);
    ensureStyle();
    applyTheme(settings);
  }

  chrome.storage.sync.get(null, apply);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") chrome.storage.sync.get(null, apply);
  });

  // If the site rewrites <html class="...">, put the theme classes back.
  new MutationObserver(() => {
    if (themeOn(settings) !== root.classList.contains("cx-on")) applyTheme(settings);
  }).observe(root, { attributes: true, attributeFilter: ["class"] });

  // Re-add our style if the page drops it; keep glitch tags current as replies stream in.
  new MutationObserver(() => {
    if (!document.getElementById(STYLE_ID)) ensureStyle();
    scheduleTag();
  }).observe(root, { childList: true, subtree: true, characterData: true });

  // Start tagging only after the page has finished loading.
  const start = () => setTimeout(() => { started = true; scheduleTag(); }, 1200);
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
