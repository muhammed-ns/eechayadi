<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# 🦟 Eechayadi — The Useless Mosquito Killer

## Basic Details
### Team Name: Onnulla

### Team Members
- Team Lead: Silpa P M - College of Engineering Adoor
- Member 1: Muhammed N S - College of Engineering Adoor

### Project Description
A browser-based AR game where **virtual mosquitoes fly over your live webcam feed** and target your actual face. You must physically **clap your hands** in front of the camera to swat them dead — no mouse, no keyboard, no mercy. The game uses real-time AI hand tracking and face detection to make you look completely ridiculous in front of anyone watching.

### The Problem (that doesn't exist)
Mosquitoes are annoying. But what if they were *also* digital, completely harmless, and required you to flail your arms wildly in front of your laptop camera to defeat them? Nobody was losing sleep over this. Nobody asked for a solution. We built one anyway.

### The Solution (that nobody asked for)
We trained your webcam to watch your hands and your face — then spawned mosquitoes that specifically orbit *your head* and only die when you physically clap near them. The computer uses AI to detect your real-world hand clap motion, calculates clap speed and proximity, and rewards you with glorious blood splatter effects across the screen. You literally look like you're trying to fight ghosts.

## Technical Details
### Technologies/Components Used
For Software:
- **Languages**: Python 3.13, JavaScript (ES Modules), HTML5, CSS3
- **Frameworks**: FastAPI (Python backend), Uvicorn (ASGI server)
- **Libraries**:
  - MediaPipe Hands (real-time 2-hand landmark tracking at 21 points per hand)
  - MediaPipe Face Detection (player face position for mosquito targeting)
  - Web Audio API (procedural sound synthesis — no audio files needed)
  - HTML5 Canvas 2D (all game rendering, mosquito drawing, blood effects)
  - WebSockets (real-time game-backend communication)
  - SQLite (leaderboard persistence via Python `database.py`)
- **Tools**: VS Code, Python venv, npm-free vanilla JS modules

For Hardware:
- Any laptop/desktop with a **webcam** (720p+ recommended)
- A **microphone** (optional — for audio clap backup detection)
- Hands (required — minimum 2)
- A face (required — mosquitoes need something to orbit)

### Implementation
For Software:
# Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd uselessProject

# 2. Create and activate Python virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux/Mac:
source venv/bin/activate

# 3. Install Python dependencies
pip install fastapi uvicorn websockets

# 4. Initialize and run the backend server
cd backend
python server.py
```

# Run

```bash
# Start the FastAPI backend (serves both API and frontend)
cd backend
python server.py

# Open your browser at:
# http://localhost:8000
```

The game auto-serves the frontend at `http://localhost:8000`.  
- Allow **camera** and **microphone** permissions when prompted.
- Wait for calibration (~3 seconds), then START CLAPPING.

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](ScreenShots\ss1.png)

![Screenshot2](ScreenShots\ss2.png)

![Screenshot3](ScreenShots\ss3.png)

# Diagrams
![Workflow](Add your workflow/architecture diagram here)


### Project Demo
# Video
[ScreenShots\video1.mp4]

# Additional Demos
- Live at: `http://localhost:8000` after running the backend
- Supports two simultaneous mosquitoes that increase in speed and aggression across 5 difficulty levels
- AI detects clap gesture from hand convergence speed (camera) + audio spike (microphone backup)

## Team Contributions
- **Silpa P M**: Game design, UI/UX, mosquito AI flight behavior, scoring system, effects pipeline
- **Muhammed N S**: Python FastAPI backend, WebSocket integration, MediaPipe hand/face tracking, AI clap detection engine, swarm physics

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)


