# ⚡ AnimeComedyGen

> **Create viral anime-style comedy videos right in your browser — no installs, no accounts, no fees.**

![AnimeComedyGen banner](https://img.shields.io/badge/AnimeComedyGen-FF2D78?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMiAyMmgyMEwxMiAyeiIvPjwvc3ZnPg==)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

---

## 🎬 Demo

Open `index.html` in any modern browser — that's it. No build step, no server required.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎭 **10 Characters** | Student, Teacher, Hero, Villain, Idol, Samurai, Wizard, Kawaii Girl, Office Guy, Sensei |
| 😱 **10 Emotions** | Happy, Shocked, Angry, Crying, Smug, Cool, Nervous, Determined, Embarrassed, Dead |
| 🌆 **6 Backgrounds** | Classroom, Anime City Street, Dramatic Sky, Sakura Park, Dojo/Temple, Cosmic Space |
| 💥 **7 SFX** | Flash, Dramatic (speed lines + vignette), Burst (comic star), Screen Shake, Rainbow, Sweat Drops |
| 🎨 **5 Comedy Styles** | Shonen Energy, Slice of Life, Chibi Chaos, Anime Meme, Reaction Face |
| ⏱ **Scene Timing** | 2 s / 3 s / 4.5 s per scene |
| 📹 **Video Export** | Downloads as `.webm` (or `.mp4` where supported) via MediaRecorder API |
| 📱 **Responsive** | Works on desktop and mobile browsers |
| 🚫 **Zero dependencies** | Pure HTML + CSS + Canvas 2D — no frameworks, no bundlers |

---

## 🚀 Quick Start

### Option A — Open locally
```bash
git clone https://github.com/YOUR_USERNAME/anime-comedy-gen.git
cd anime-comedy-gen
# Just open index.html in your browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

### Option B — GitHub Pages (free hosting)
1. Fork this repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Visit `https://YOUR_USERNAME.github.io/anime-comedy-gen/`

### Option C — Any static host
Upload the entire folder to Netlify, Vercel, Cloudflare Pages, or any web host. No build step needed.

---

## 📁 Project Structure

```
anime-comedy-gen/
├── index.html          # Entry point — HTML structure & script loading
├── css/
│   └── style.css       # All styles (manga theme, layout, animations)
├── js/
│   ├── constants.js    # Shared data (characters, emotions, SFX, defaults)
│   ├── renderer.js     # Canvas 2D engine (BGs, characters, SFX, captions)
│   ├── editor.js       # Scene editor UI (add / remove / update scenes)
│   ├── player.js       # Animation loop & playback controls
│   ├── recorder.js     # MediaRecorder wrapper for video download
│   └── app.js          # Bootstrap — wires everything together
├── LICENSE
└── README.md
```

### Module responsibilities

```
constants.js   ←  renderer.js  ←─┐
                                  │
                  editor.js   ←───┤
                                  ├─── app.js  (bootstrap)
                  player.js   ←───┤
                                  │
                  recorder.js ←───┘
```

> Scripts are loaded in dependency order at the bottom of `index.html` — no module bundler needed.

---

## 🖥️ How It Works

1. **Editor** — Users build a list of scenes, each with a character, emotion, dialogue text, and SFX.
2. **Renderer** — A `requestAnimationFrame` loop draws each scene onto an HTML `<canvas>` using 2D context calls (no WebGL, no third-party graphics library).
3. **Player** — Advances scenes based on elapsed time and the chosen scene duration.
4. **Recorder** — Captures the canvas stream via `canvas.captureStream(30)` and feeds it into `MediaRecorder`. When stopped, the recorded chunks are assembled into a Blob and offered as a download.

---

## 🎨 Customisation

### Add a new character
In `js/constants.js`, append to `CHARS`, `CHAR_COLORS`, and `HAIR_COLORS`:
```js
const CHARS = [..., 'Ninja'];
const CHAR_COLORS = { ..., 'Ninja': '#1a1a1a' };
const HAIR_COLORS = { ..., 'Ninja': '#cc0000' };
```

### Add a new background
In `js/renderer.js`, add a function to `BG_RENDERERS`:
```js
const BG_RENDERERS = {
  // ...existing themes...
  beach(ctx, W, H, t) {
    // your drawing code here
  },
};
```
Then add the matching `<option>` to `#bgTheme` in `index.html`.

### Add a new SFX
In `js/constants.js` append to `SFX_OPTIONS`, then add a `case` in the `drawSFX` function in `js/renderer.js`.

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome 94+ | ✅ Full (VP9 recording) |
| Edge 94+   | ✅ Full |
| Firefox 113+ | ✅ Full (VP8 recording) |
| Safari 16+ | ⚠️ Preview works; `.mp4` recording requires macOS 13+ |
| Mobile Chrome | ✅ Preview works; recording may vary by device |

> **Note:** Video export uses the `MediaRecorder` API. If your browser doesn't support it, the preview still works but the Save button won't download a file.

---

## 📜 License

[MIT](LICENSE) © 2024 AnimeComedyGen contributors.  
Free to use, modify, and distribute. Attribution appreciated but not required.

---

## 🤝 Contributing

Pull requests are welcome! Some ideas for contributions:

- 🎵 Add background music / sound effects using the Web Audio API
- 🖼️ More background themes (beach, festival, haunted house…)
- 👁️ More emotion expressions
- 📤 Add GIF export (using gif.js or similar)
- 💾 LocalStorage save / load for scene drafts
- 🌍 i18n / multi-language caption support

Please open an issue first to discuss larger changes.

---

<p align="center">Made with ❤️ and Canvas 2D API</p>
