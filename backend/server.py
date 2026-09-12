"""
server.py
FastAPI + WebSockets server backend for Mosquito Mayhem.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import uvicorn
import json
import os
import asyncio

import sys
sys.path.append(os.path.dirname(__file__))

from database import init_db, get_top_leaderboard, submit_score
from clap_analyzer import PythonClapAnalyzer
from swarm_physics import PythonSwarmPhysics
from gpu_runtime import get_gpu_status

app = FastAPI(title="Mosquito Mayhem API")

# Enable CORS for cross-origin browser requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite Database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# REST Endpoints
@app.get("/api/status")
def status():
    return {
        "status": "ONLINE",
        "engine": "Python 3.13 FastAPI + WebSockets",
        "game": "Mosquito Mayhem Backend",
        "gpu": get_gpu_status()
    }

@app.get("/api/leaderboard")
def leaderboard():
    return {"leaderboard": get_top_leaderboard(10)}

@app.post("/api/score")
async def post_score(request: Request):
    data = await request.json()
    username = data.get("username", "PLAYER")
    kills = int(data.get("kills", 0))
    misses = int(data.get("misses", 0))
    accuracy = float(data.get("accuracy", 100.0))
    best_streak = int(data.get("best_streak", 0))
    rank_title = data.get("rank_title", "EX-TERMINATOR")

    updated_board = submit_score(username, kills, misses, accuracy, best_streak, rank_title)
    return {"status": "SUCCESS", "leaderboard": updated_board}

# Real-Time WebSocket Game Endpoint
@app.websocket("/ws/game")
async def websocket_game(websocket: WebSocket):
    await websocket.accept()
    analyzer = PythonClapAnalyzer()
    swarm = PythonSwarmPhysics()

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            msg_type = payload.get("type")

            if msg_type == "PING":
                await websocket.send_json({"type": "PONG", "timestamp": payload.get("timestamp")})

            elif msg_type == "ANALYZE_AUDIO":
                samples = payload.get("samples", [])
                result = analyzer.analyze_audio_chunk(samples)
                await websocket.send_json({
                    "type": "AUDIO_RESULT",
                    "clap": result
                })

            elif msg_type == "COMPUTE_SWARM":
                mosquitoes = payload.get("mosquitoes", [])
                face_pos = payload.get("face_pos")
                left_hand = payload.get("left_hand")
                right_hand = payload.get("right_hand")
                diff_level = payload.get("difficulty", 1)

                updated = swarm.compute_next_frame(mosquitoes, face_pos, left_hand, right_hand, diff_level)
                await websocket.send_json({
                    "type": "SWARM_UPDATE",
                    "mosquitoes": updated
                })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print("WebSocket Error:", e)

# Serve Frontend static files from workspace root
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(ROOT_DIR, "index.html"))

app.mount("/", StaticFiles(directory=ROOT_DIR, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
