# Void Runner (formerly Solar Race)

A high-speed, infinite 3D space survival game built with **Three.js** and **Vite**. 

Pilot a starfighter through a pitch-black starry void, dodge incoming spinning meteors, and collect glowing cyan energy cores to keep your fuel from running out.

## Features
- **3D Procedural Space Environment**: Infinite starry sky with massive distant planets.
- **Dynamic Physics & Hitboxes**: Realistic ship banking and pitching as you weave through space debris.
- **3 Camera Modes**: Press `C` to instantly swap between 1st Person (Nose Cam), Close Chase, and Far Cinematic Chase cameras.
- **Progressive Difficulty**: The longer you survive, the faster the meteors spawn and hurtle towards you.
- **Mobile Responsive**: Fully supports touch devices with a responsive SVG D-Pad.

## Controls
- **W / S** or **Up / Down Arrows**: Move vertically
- **A / D** or **Left / Right Arrows**: Move horizontally
- **C**: Toggle Camera Mode

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/venkatesh0963/solar-race.git
   cd solar-race
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173/`.

## Tech Stack
- Vanilla JavaScript (ES6+)
- [Three.js](https://threejs.org/) for WebGL rendering
- [Vite](https://vitejs.dev/) for fast builds and hot reloading
