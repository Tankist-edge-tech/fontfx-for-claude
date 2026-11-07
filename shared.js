// Settings, palettes and color helpers shared by the page script and the popup.
var CX = (() => {
  const DEFAULTS = {
    enabled: true,
    // fonts
    font: "", codeFont: "", size: 100, lineHeight: 0,
    // theme
    base: "off",            // off | dark | black | light | paper | custom
    customBg: "#140d1f",    // background color for the custom base
    palette: "neon",        // key of PALETTES, or "custom"
    customA: "#ff2e88",
    customB: "#00f0ff",
    themeFonts: true,
    // effects
    fxGlitch: true, fxGrid: true, fxScan: true, fxSharp: true, fxMotion: true,
    glitchSpeed: "normal",  // calm | normal | wild
    // ambient background
    ambient: "off",         // off | aurora | particles | breathe | waves
    ambientLevel: 45,       // 0–100
    ambientSpeed: 1,        // 0.25–2
    ambientFocus: true,     // keep the middle (where you read) clear
    ambientClearInput: false // keep the prompt box clear
  };

  const PALETTES = {
    neon:   { name: "Neon",   a: "#ff2e88", b: "#00f0ff" },
    ice:    { name: "Ice",    a: "#00e5ff", b: "#ff3dff" },
    matrix: { name: "Matrix", a: "#00ff66", b: "#ff2e88" },
    amber:  { name: "Amber",  a: "#ffaa00", b: "#1ac6ff" },
    violet: { name: "Violet", a: "#a855ff", b: "#00f5c0" },
    sunset: { name: "Sunset", a: "#ff6b3d", b: "#b14dff" },
    ocean:  { name: "Ocean",  a: "#2f7bff", b: "#00e0b8" },
    sakura: { name: "Sakura", a: "#ff7eb6", b: "#ffd36e" },
    mono:   { name: "Mono",   a: null,      b: null }   // follows the base: white on dark, black on light
  };

  // Surfaces and text for each base, as "H S% L%".
  const BASES = {
    dark: {
      sf0: "240 25% 2.5%", sf1: "240 25% 3.5%", sf2: "240 20% 6.5%", sf3: "240 16% 9%", pop: "240 14% 12%",
      light: false, glow: 1, scan: 0.16,
      bg: "240 25% 3.5%", bg2: "240 25% 2.5%", code: "240 25% 4%",
      s0: "240 20% 6.5%", s1: "240 16% 9%", s2: "240 14% 12%", s3: "240 12% 16%",
      line: "240 14% 22%",
      t0: "0 0% 98%", t1: "240 20% 93%", t2: "240 12% 80%", t3: "240 10% 64%", t4: "240 9% 52%", t5: "240 8% 40%",
      bd1: "240 12% 85%", bd2: "240 12% 75%", bd3: "240 12% 70%", bd4: "240 12% 60%"
    },
    black: {
      sf0: "0 0% 0%", sf1: "0 0% 0%", sf2: "0 0% 4.5%", sf3: "0 0% 7%", pop: "0 0% 11%",
      light: false, glow: 1, scan: 0.2,
      bg: "0 0% 0%", bg2: "0 0% 0%", code: "0 0% 3%",
      s0: "0 0% 4.5%", s1: "0 0% 7%", s2: "0 0% 10%", s3: "0 0% 14%",
      line: "0 0% 17%",
      t0: "0 0% 100%", t1: "0 0% 92%", t2: "0 0% 78%", t3: "0 0% 62%", t4: "0 0% 50%", t5: "0 0% 38%",
      bd1: "0 0% 88%", bd2: "0 0% 78%", bd3: "0 0% 72%", bd4: "0 0% 62%"
    },
    light: {
      sf0: "220 18% 94%", sf1: "220 20% 97.5%", sf2: "0 0% 100%", sf3: "0 0% 100%", pop: "0 0% 100%",
      light: true, glow: 0.35, scan: 0.045,
      bg: "220 20% 97%", bg2: "220 18% 94%", code: "220 22% 96%",
      s0: "0 0% 100%", s1: "220 16% 93%", s2: "220 14% 89%", s3: "220 12% 84%",
      line: "220 12% 80%",
      t0: "225 25% 7%", t1: "225 20% 12%", t2: "225 12% 28%", t3: "225 8% 42%", t4: "225 6% 52%", t5: "225 6% 62%",
      bd1: "225 20% 8%", bd2: "225 18% 15%", bd3: "225 15% 20%", bd4: "225 12% 30%"
    },
    paper: {
      sf0: "40 25% 91%", sf1: "40 30% 95%", sf2: "40 40% 98.5%", sf3: "40 40% 98.5%", pop: "40 45% 99%",
      light: true, glow: 0.3, scan: 0.04,
      bg: "40 30% 95%", bg2: "40 25% 91%", code: "40 28% 93%",
      s0: "40 40% 98.5%", s1: "40 22% 90%", s2: "38 18% 86%", s3: "38 15% 80%",
      line: "38 15% 76%",
      t0: "30 20% 8%", t1: "30 15% 13%", t2: "30 10% 30%", t3: "30 8% 42%", t4: "30 6% 52%", t5: "30 6% 62%",
      bd1: "30 20% 8%", bd2: "30 18% 14%", bd3: "30 15% 20%", bd4: "30 12% 30%"
    }
  };

  // Build a full base (surfaces, text, borders) from one background color.
  function customBase(hex) {
    const [r, g, b] = hexToRgb(hex);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const light = lum > 0.5;
    let [h, sat, l] = rgbToHsl([r, g, b]);
    // keep text readable: very mid-tone backgrounds are nudged a little darker / lighter
    l = light ? Math.max(l, 78) : Math.min(l, 32);
    const c = (v) => Math.max(0, Math.min(100, Math.round(v * 10) / 10));
    const S = (v, ss = sat) => `${h} ${c(ss)}% ${c(v)}%`;
    const ts = Math.min(sat, light ? 25 : 15);   // text: a hint of the hue, not full color
    if (!light) return {
      light: false, glow: 1, scan: 0.16,
      sf0: S(l - 1.5), sf1: S(l), sf2: S(l + 3), sf3: S(l + 5.5), pop: S(l + 8.5),
      bg: S(l), bg2: S(l - 1.5), code: S(l + 0.6),
      s0: S(l + 3), s1: S(l + 5.5), s2: S(l + 8.5), s3: S(l + 12.5),
      line: S(l + 18, Math.min(sat, 30)),
      t0: S(98, ts), t1: S(93, ts), t2: S(80, ts), t3: S(65, ts), t4: S(53, ts), t5: S(41, ts),
      bd1: S(85, ts), bd2: S(75, ts), bd3: S(70, ts), bd4: S(60, ts)
    };
    return {
      light: true, glow: 0.35, scan: 0.045,
      sf0: S(l - 3), sf1: S(l), sf2: S(l + 2.5), sf3: S(l + 2.5), pop: S(l + 3),
      bg: S(l), bg2: S(l - 3), code: S(l - 1.5),
      s0: S(l + 2.5), s1: S(l - 4), s2: S(l - 8), s3: S(l - 13),
      line: S(l - 17, Math.min(sat, 30)),
      t0: S(7, ts), t1: S(12, ts), t2: S(28, ts), t3: S(42, ts), t4: S(52, ts), t5: S(62, ts),
      bd1: S(8, ts), bd2: S(15, ts), bd3: S(20, ts), bd4: S(30, ts)
    };
  }

  // The base in use for these settings (null when the theme is off).
  function baseFor(s) {
    if (s.base === "custom") return customBase(s.customBg);
    return BASES[s.base] || null;
  }

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    const n = parseInt(m ? m[1] : "ff2e88", 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }
  const hslStr = ([h, s, l]) => `${h} ${s}% ${l}%`;

  // Resolve the two accent colors for a base + palette.
  function colors(s) {
    const base = baseFor(s) || BASES.dark;
    let a, b;
    if (s.palette === "custom") { a = s.customA; b = s.customB; }
    else if (s.palette === "mono") { a = base.light ? "#111111" : "#f2f2f2"; b = base.light ? "#7a7a7a" : "#8c8c8c"; }
    else { const p = PALETTES[s.palette] || PALETTES.neon; a = p.a; b = p.b; }
    const ha = rgbToHsl(hexToRgb(a)), hb = rgbToHsl(hexToRgb(b));
    // "ink" versions stay readable as text on the base
    const ink = ([h, sat, l]) => base.light ? [h, sat, Math.min(l, 36)] : [h, sat, Math.max(l, 58)];
    return {
      hexA: a, hexB: b, rgbA: hexToRgb(a), rgbB: hexToRgb(b),
      a: hslStr(ha), b: hslStr(hb), ai: hslStr(ink(ha)), bi: hslStr(ink(hb)),
      on: ha[2] > 60 ? "0 0% 5%" : "0 0% 100%"
    };
  }

  // Old 2.0 settings used { theme: "pink" | ... }
  function migrate(raw) {
    const s = { ...DEFAULTS, ...raw };
    const old = { pink: "neon", cyan: "ice", green: "matrix", amber: "amber", violet: "violet" };
    if (raw && raw.theme && !("base" in raw)) {
      if (old[raw.theme]) { s.base = "dark"; s.palette = old[raw.theme]; }
    }
    delete s.theme;
    return s;
  }

  return { DEFAULTS, PALETTES, BASES, baseFor, colors, migrate };
})();
