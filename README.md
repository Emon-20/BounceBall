# 🔴 Bounce Classic (RetroSphere Odyssey)

A web-based 2D side-scrolling platformer inspired by the legendary Nokia mobile classic. Features continuous rolling physics, natural bouncing elasticity, power-up tools (Growth, Shrink, Super Jump), collectible gold coins, dynamic obstacles, and nostalgic retro aesthetics.

---

## 🎮 Game Specifications & Rules

### 1. Core Gameplay
- **Side-Scrolling Auto-Runner:** The red sphere automatically rolls forward along continuous terrain at a steady forward velocity.
- **Bouncing Physics:** Realistic 2D physics with gravity, horizontal momentum, and natural ground bounce elasticity.
- **Jump Timing:** Tap the screen or press Jump to leap over spikes, gaps, and barricades. Features coyote time and jump buffering for responsive control.

### 2. Collectibles
- **Gold Coins:** Scattered along paths and aerial arcs. Collect them to rack up your score and achieve 3-star level ratings (+100 pts each).

### 3. Power-Up Tools
Collect floating tool orbs along the route to temporarily alter the sphere's physical state:
- **🔼 Growth Tool:** Dramatically increases ball radius by 1.75x. Grants massive weight and the power to smash through breakable brick walls!
- **🔽 Shrink Tool:** Compresses the ball to miniature size (0.58x). Allows the sphere to slide underneath low tunnel ceilings and dodge oscillating crushers.
- **⚡ Super Jump Tool:** Boosts jump impulse (+40%) and surface bounce restitution, letting the player clear cavernous spike pits and reach high coin crowns.

### 4. Obstacles & Hazards
- **Static Hazards:** Precision spike beds, chasms/pits, step blocks, and ceiling spikes.
- **Breakable Blocks:** Sturdy brick crates that can only be shattered when under the Growth Tool effect.
- **Dynamic Obstacles:** Moving ferry and elevator platforms, plus rhythmic spiky crusher pillars that slam down in sequence.

### 5. Levels & Progression
- **Level 1 — Emerald Meadow:** Introduction to rolling physics, coin arcs, moving platforms, and Super Jump canyon leap.
- **Level 2 — Brick Fortress:** Battlements featuring breakable brick gates requiring the Growth Tool.
- **Level 3 — Tunnel Maze:** Low tunnels requiring the Shrink Tool, tight gaps, and rhythmic crushers.
- **Level 4 — Neon Overdrive:** Climactic master run requiring swift transitions across all 3 power-ups.
- **Endless Rush:** Procedurally generated infinite obstacle run with progressive speed scaling and score multiplier!
- **Finish Line:** Distinct checkered archway with waving flags. Crossing the finish line triggers celebration fanfare and level completion.

---

## 🕹️ Controls

| Action | Desktop (Keyboard / Mouse) | Mobile (Touch) |
| :--- | :--- | :--- |
| **Jump** | `Space`, `W`, `Up Arrow`, or Left Click | Tap anywhere on screen or **TAP TO JUMP** button |
| **Pause** | `P` or `Esc` | Tap **⏸** button on HUD |
| **Quick Restart** | `R` key | Tap **Restart** in Pause / Game Over menu |

---

## 🎨 Visual Themes & Sound

- **Retro Themes:** Switch between **Arcade Classic** (vibrant 16-bit colors), **Nokia 3310** (monochrome LCD green matrix), and **Cyber Synthwave** (neon dark mode).
- **CRT Scanlines:** Optional retro monitor scanline overlay.
- **Standalone Audio Engine:** 100% procedural 8-bit sound effects (jumps, bounces, coin chimes, tool fanfares, smash blasts, pops) and background chiptune synthesised in real time via the Web Audio API — zero external asset loading needed.

---

## 📁 Modular Project Structure

```text
bounceball/
├── index.html                  # Accessible semantic markup, HUD, and overlays
├── style.css                   # Responsive layout, retro tokens, and HUD cards
├── game.js                     # Root entry point delegate
├── js/
│   ├── game.js                 # Main game controller & animation loop
│   ├── physics.js              # 2D ball physics, elasticity, and collisions
│   ├── entities.js             # Ball, Coin, PowerUp, Obstacle, FinishLine
│   ├── levels.js               # 4 Handcrafted levels + Endless generator
│   ├── renderer.js             # Parallax scrolling, CRT, and theme rendering
│   ├── particles.js            # Dust puffs, sparkles, auras, debris, confetti
│   ├── audio.js                # Web Audio API synthesizer for SFX & BGM
│   └── ui.js                   # HUD counters, progress tracks, and modal dialogs
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages automated deployment workflow
└── README.md                   # Complete documentation
```

---

## 🚀 Local Development & Deployment

### Run Locally
Serve the directory with any static HTTP server (ES modules require HTTP/HTTPS):
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```
Open `http://localhost:8000` in your browser.

### Automatic GitHub Pages Deployment
A GitHub Actions workflow is provided at `.github/workflows/deploy.yml`. When pushed to your `main` branch:
1. Go to your repository settings on GitHub -> **Pages**.
2. Select **Source: GitHub Actions**.
3. Pushes to `main` will automatically build and publish the game!

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
