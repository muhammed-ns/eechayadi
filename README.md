# 🦟 MOSQUITO MAYHEM — THE USELESS MOSQUITO KILLER (Python AI Edition)

> **“You spent a minute killing mosquitoes that never existed.”**

**Mosquito Mayhem** is an advanced browser-based interactive game powered by a high-performance **Python 3.13 FastAPI + WebSockets** backend. It combines live webcam video feeds, MediaPipe dual hand computer vision, player face tracking, Python acoustic clap signal processing (FFT & PAPR), physics swarm dynamics, and SQLite leaderboards.

---

## 🐍 Python Backend Architecture

- **FastAPI & Uvicorn Server**: Running on port `8000` (`backend/server.py`).
- **Real-Time WebSockets (`ws://localhost:8000/ws/game`)**: Bi-directional communication for acoustic signal analysis and server-side swarm trajectory updates.
- **SQLite Database (`backend/mosquito_mayhem.db`)**: Persistent global leaderboards, player stats, rank titles, and match history (`backend/database.py`).
- **Python FFT Acoustic Clap Analyzer (`backend/clap_analyzer.py`)**: Uses NumPy for spectral centroid calculations and peak-to-average power ratio (PAPR) analysis to identify physical claps.
- **Python Swarm Physics Engine (`backend/swarm_physics.py`)**: Solves server-side wind dynamics, face attractor vectors, and dual hand avoidance forces.

---

## 🎮 Gameplay & Computer Vision

- 📷 **Live Mirrored Camera View**: Video feed mirrored horizontally on HTML5 Canvas.
- 🎯 **Player Face Detection (`FaceTracker.js`)**: Tracks the player's head and draws a `🎯 TARGET FACE` halo. Mosquitoes are naturally attracted to and orbit around the player's face.
- ✋ **Dual Hand Computer Vision (`HandTracker.js`)**: Tracks both Left & Right hands using MediaPipe Hands (`maxNumHands: 2`).
- 💥 **Clap Zone & Trapped Mosquitoes (`HitDetector.js`)**: Detects when mosquitoes are trapped between hands in the `💥 CLAP ZONE` during physical claps.
- 🩸 **Dripping Blood Lens Splatters (`BloodEffect.js`)**: Explosive blood droplet particles, screen lens decals, and dripping blood droplets sliding down the screen.

---

## 🚀 How to Run

### Option A: Complete Python Backend Server (Recommended)
```bash
python backend/server.py
```
Then navigate to: `http://localhost:8000`

### Option B: Uvicorn Direct Launch
```bash
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000
```
Then navigate to: `http://localhost:8000`
