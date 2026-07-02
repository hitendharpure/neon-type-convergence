# Neon Type Convergence 🌌

**Neon Type Convergence** is an interactive, cinematic WebGL and Three.js simulation where 20,000 autonomous nodes dynamically map and converge to form any custom text input. Powered by a custom `Float32Array` physics engine optimized for a flawless 120 FPS, the swarm utilizes critically damped precision and interactive lighting to lock into structural formations with zero jitter.

## ✨ Key Features

* **Dynamic Text Convergence (Up to 50 Characters):** Enter any custom text, and the engine internally renders it to a hidden 2D canvas, extracting the exact geometry. The system features robust text-wrapping and dynamic font scaling to perfectly fit longer phrases within the 3D particle bounds. 
* **Nearest-Neighbor Spatial Hashing:** Implements an O(N log N) sorting algorithm to eliminate chaotic crossing paths, flawlessly mapping wild particles to their closest geometric target on the text.
* **Critically Damped Oscillators:** Replaces standard bouncy spring physics with analytical smooth damping. Particles aggressively accelerate and lock into your custom letters with zero overshoot, vibration, or jitter.
* **Custom Physics Engine:** Untied from the frame rate using absolute delta time (dt) and true Euler Integration for consistent speeds across all monitor refresh rates (60Hz to 144Hz+).
* **Audio Reactivity:** Integrates the Web Audio API to map frequency bands to particle velocity, swarm magnetic pull, and additive blooming brightness.
* **Cinematic UI:** A strictly minimal interface. The text input rests in the corner, and the central command prompt instantly drops to 0% opacity the exact millisecond you interact, keeping the visual focus 100% on the swarm.

## 🚀 Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
