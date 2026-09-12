# 🦟 MOSQUITO MAYHEM — THE USELESS MOSQUITO KILLER

> **“You spent a minute killing mosquitoes that never existed.”**

**Mosquito Mayhem** is a browser-based interactive arcade game that uses your webcam, MediaPipe hand tracking, microphone real-time audio clap detection, physics, and HTML5 Canvas to let you physically clap and swat virtual mosquitoes floating in your room.

---

## 🎮 Features

- 📷 **Live Webcam Background**: Horizontally mirrored webcam feed acting like an interactive mirror.
- ✋ **MediaPipe Hand Tracking**: Real-time hand landmark tracking and physical swat velocity calculation.
- 🎤 **Web Audio API Clap Detection**: Dynamic audio calibration and peak RMS energy spike detection to measure physical clap power.
- 🦟 **Virtual Mosquito Physics & AI**: Erratically moving mosquitoes with 40Hz flapping translucent wings, speech bubbles on miss, hand avoidance fleeing AI, and special variants (Golden, Speed, Boss).
- 🩸 **Visual & Audio Splatter Effects**: Dynamic blood particle explosions, persistent lens decals, floating arcade text, screen flashes, and procedurally synthesized Web Audio sound effects.
- 🏆 **Arcade HUD & Progression**: 60-second timer, 5 difficulty levels, kill streak combos, ranks, achievements, and LocalStorage high score saving.

---

## 🚀 How to Run

1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Click **START GAME**.
3. Allow **Camera** and **Microphone** access.
4. Complete the 2-clap **Calibration** phase.
5. Aim with your hand and **CLAP LOUDLY** to swat the mosquitoes!

---

## 🛠️ Technology Stack

- HTML5 & CSS3 (Glassmorphism Arcade Theme)
- Vanilla JavaScript (ES Modules)
- MediaPipe Hands (CDN)
- WebRTC `getUserMedia()`
- Web Audio API (Audio Context, AnalyserNode, Procedural Sound Synthesizer)
- HTML5 Canvas Engine
- LocalStorage Persistence
