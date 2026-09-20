# Velocity: Zero

A high-speed, infinite 3D space survival game built from scratch using **Vanilla JavaScript**, **Three.js**, and **Vite**.

---

## 📖 About Velocity: Zero

**Velocity: Zero** is a synthwave-inspired arcade space dodger. Pilot a highly responsive starfighter through a pitch-black starry void. Your objective is simple: survive as long as possible while dodging incoming spinning meteors and collecting glowing cyan energy cores to keep your engine running.

**Developed by Playmotions**  
📱 Follow us on Instagram: [@playmotions](https://instagram.com/playmotions)

---

## 🌟 Features

- **Infinite Procedural Generation:** Fly through a dynamically generated space environment. Meteors and planets spawn procedurally as you fly, ensuring no two runs are the same.
- **Arcade 3-Lives System:** Start with 3 lives. Taking a hit triggers a massive particle explosion, grants 2 seconds of invincibility (with a blinking effect), and shakes the camera.
- **Dynamic Physics & Hitboxes:** Realistic ship banking and pitching as you weave through space debris. Hitboxes are dynamically adjusted to feel fair and responsive.
- **Multi-Camera System:** Press `C` to instantly swap between 3 distinct camera modes:
  - **1st Person (Nose Cam):** Hard-locked to the front of the ship. You feel every single bank, roll, and pitch.
  - **Close Chase:** Hovering tightly behind the ship for fast-paced action.
  - **Far Cinematic Chase:** A sweeping, smooth follow camera.
- **Progressive Difficulty Scaling:** The longer you survive, the harder the game gets. The ship's speed increases, and the spacing between meteor clusters decreases.
- **Synthwave UI & Mobile Support:** Features a neon cyber-datapad landing page, fully supports touch devices with an on-screen SVG D-Pad for 4-way movement, and a built-in HUD camera toggle button.

---

## 🎮 Controls

### Keyboard (Desktop)
- **W / S** or **Up / Down Arrows**: Move vertically (Pitch)
- **A / D** or **Left / Right Arrows**: Move horizontally (Bank/Roll)
- **C**: Toggle Camera Mode
- **UI Buttons**: Pause, Resume, Restart, Main Menu

### Touch (Mobile)
- **On-Screen D-Pad**: Use the bottom-right of the screen to tap/hold Up, Down, Left, and Right.
- **Camera Button**: Tap the 🎥 icon in the top center to change camera views.

---

## 🚀 Core Mechanics

1. **Fuel System**: Your energy meter constantly drains. If it hits 0%, your engine dies and it's Game Over.
2. **Energy Cores**: Look for the glowing cyan crystalline rings floating in space. Flying near them sucks them in, restoring 15% of your energy and granting bonus points.
3. **Meteors**: Rocky, dark asteroids that hurtle *towards* you at high speeds. Hitting one removes a life!

---

## 🛠️ Tech Stack

- **[Three.js](https://threejs.org/)**: The core WebGL engine used for rendering the 3D scene, models, lighting, particles, and math (Vectors/Bounding Boxes).
- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling used for instant server start, lightning-fast HMR, and optimized production builds.
- **Vanilla JavaScript (ES6+)**: Pure object-oriented ES6 classes. No heavy frameworks.
- **HTML5 & CSS3**: For the synthwave HUD, touch controls, and typography.

---

## 📁 Project Structure

```text
solar-race/
├── index.html           # Main entry point and UI/HUD markup
├── style.css            # Styles for HUD, buttons, and layout
├── src/
│   ├── main.js          # Bootstraps the game and handles UI event listeners
│   ├── Game.js          # The core game loop, renderer, lighting, particles, and camera logic
│   ├── Player.js        # Builds the 3D Starfighter mesh and handles movement physics
│   ├── Environment.js   # Manages procedural spawning of stars, planets, meteors, and coins
│   └── InputManager.js  # Unifies Keyboard and Touch inputs into a simple axis system
└── package.json         # Project dependencies and Vite scripts
```

---

## 💻 Setup & Installation

To run this project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/venkatesh0963/solar-race.git
   cd solar-race
   ```

2. **Install dependencies:**
   Ensure you have [Node.js](https://nodejs.org/) installed.
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Play:**
   Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173/`).

---

## 🔮 Future Improvements

- Add sound effects and ambient synthwave background music.
- Implement a persistent high score system (Local Storage).
- Global leaderboards using a backend service like Firebase.

---

*Built with passion and Three.js!*
