<div align="center">

# FONT/FX for Claude

**Themes, custom colors, fonts, glitch effects and calm ambient backgrounds for [claude.ai](https://claude.ai).**

<sub>Unofficial browser extension. Not affiliated with or endorsed by Anthropic.</sub>

<br>

<img src="docs/screenshots/hq.png" width="100%" alt="HQ">

<img src="docs/hero.gif" alt="FONT/FX for Claude cycling through different themes" width="100%">

</div>

---

## Features

**Backgrounds.** Claude's normal look, Dark, Black (pure black for OLED screens), Light, Paper (warm off-white), or **Custom**. Pick any color and FONT/FX builds matching panels, borders and text, choosing dark or light text automatically so everything stays readable.

**Colors.** Nine palettes (Neon, Ice, Matrix, Amber, Violet, Sunset, Ocean, Sakura, Mono), or your own accent color plus a second color for glitch effects, links and code.

**Effects.** Glitch-outline titles that split and jitter now and then, replies that glitch in, a background grid, CRT scanlines and sharp corners. Each one can be switched on or off, and the glitch speed can be set to Calm, Normal or Wild.

**Ambient backgrounds for calm focus.**
- **Aurora:** slow drifting clouds of your colors
- **Particles:** soft floating lights
- **Breathe:** the screen edges glow in a slow 4 s in / 6 s out breathing rhythm
- **Waves:** gentle flowing lines

Intensity and speed sliders, plus **Focus mode** (keeps the reading area clear) and **Keep prompt box clear**. Effects are toned down automatically on light backgrounds, pause when the tab is hidden, and respect your system's "reduce motion" setting.

**Fonts.** Futuristic bundled fonts (Orbitron, Chakra Petch, Share Tech Mono), or any font installed on your computer for text and code, plus text size and line spacing.

**Message styling.** `● CLAUDE` / `● YOU` labels, framed messages with corner brackets, and a glowing rail while a reply is being written.

## Install

FONT/FX works in Chrome and other Chromium browsers (Edge, Brave, Opera, Arc).

1. Download the latest `fontfx-for-claude.zip` from [Releases](../../releases) and unzip it into a folder you'll keep.
   Or clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the folder.
4. Pin FONT/FX from the puzzle-piece menu and open [claude.ai](https://claude.ai).

**Updating:** replace the files in the same folder, then click reload ↻ on the extension's card. Your settings are kept.

## Using it

Click the FONT/FX button in the toolbar. The popup has three tabs:

| Tab | What's there |
| --- | --- |
| **Theme** | Background (including a custom color), color palette or custom colors, futuristic fonts on/off |
| **Effects** | Glitch, grid, scanlines, sharp corners, animations, glitch speed, ambient background and its options |
| **Fonts** | Text font, code font, text size, line spacing, with a live preview |

Changes apply instantly and are saved in your browser.

## Gallery

### New chat

<p>
<img src="docs/screenshots/24-greeting-red.jpg" width="49%" alt="New chat, red glitch-outline greeting">
<img src="docs/screenshots/23-greeting-mono.jpg" width="49%" alt="New chat, mono greeting">
</p>

### Conversations

<p>
<img src="docs/screenshots/06-chat-crimson.jpg" width="49%" alt="Crimson theme">
<img src="docs/screenshots/10-chat-blue-green-aurora.jpg" width="49%" alt="Blue and green aurora">
</p>
<p>
<img src="docs/screenshots/16-chat-ember.jpg" width="49%" alt="Ember custom background">
<img src="docs/screenshots/18-chat-matrix-aurora.jpg" width="49%" alt="Matrix green aurora">
</p>
<p>
<img src="docs/screenshots/19-chat-toxic-violet.jpg" width="49%" alt="Violet and green">
<img src="docs/screenshots/21-chat-teal-violet.jpg" width="49%" alt="Teal and violet">
</p>
<p>
<img src="docs/screenshots/17-chat-ocean-aurora.jpg" width="49%" alt="Ocean aurora on black">
<img src="docs/screenshots/02-chat-violet-glow.jpg" width="49%" alt="Violet glow">
</p>

### Light

<p>
<img src="docs/screenshots/12-chat-light.jpg" width="49%" alt="Light theme conversation">
<img src="docs/screenshots/13-settings-light.jpg" width="49%" alt="Light theme settings window">
</p>

### Claude's own windows pick up the theme too

<p>
<img src="docs/screenshots/08-settings-aurora.jpg" width="49%" alt="Settings window with aurora">
<img src="docs/screenshots/05-settings-red-black.jpg" width="49%" alt="Settings window, red on black">
</p>
<p>
<img src="docs/screenshots/20-settings-violet.jpg" width="49%" alt="Settings window, violet">
<img src="docs/screenshots/14-settings-mono-particles.jpg" width="49%" alt="Settings window, mono with particles">
</p>

<details>
<summary><b>More screenshots</b></summary>
<br>
<p>
<img src="docs/screenshots/00-chat-mono-calm.jpg" width="49%" alt="Mono, calm">
<img src="docs/screenshots/01-chat-crimson-violet.jpg" width="49%" alt="Crimson and violet">
</p>
<p>
<img src="docs/screenshots/03-chat-violet-long.jpg" width="49%" alt="Violet, long reply">
<img src="docs/screenshots/04-chat-red-black.jpg" width="49%" alt="Red on black">
</p>
<p>
<img src="docs/screenshots/07-chat-model-menu.jpg" width="49%" alt="Model menu themed">
<img src="docs/screenshots/09-settings-mono-waves.jpg" width="49%" alt="Settings, mono with waves">
</p>
<p>
<img src="docs/screenshots/11-chat-mono-gray.jpg" width="49%" alt="Mono gray">
<img src="docs/screenshots/15-chat-mono-particles.jpg" width="49%" alt="Mono with particles">
</p>
<p>
<img src="docs/screenshots/22-chat-fontfx.jpg" width="49%" alt="FONT/FX conversation">
</p>
</details>

## Privacy

FONT/FX runs only on `claude.ai`. It doesn't collect, send or store any of your data. It makes no network requests except loading its own bundled font files. Your settings are kept in Chrome's extension storage, and if you're signed in to Chrome they sync between your computers.

## Good to know

- Claude's website changes over time. If something stops being themed after an update, reload the tab, and if it's still off, please [open an issue](../../issues) with a screenshot.
- Moving backgrounds use very little power: they run at a low frame rate and pause when the tab isn't visible. Switching **Animations** off stops all motion.

## Credits

Bundled fonts: [Orbitron](https://fonts.google.com/specimen/Orbitron), [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) and [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono), all under the SIL Open Font License (see `fonts/LICENSES.txt`).

## License

[MIT](LICENSE)
