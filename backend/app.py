"""
app.py
Next-Level FastAPI + WebSockets + SQLite Backend Server for Mosquito Mayhem.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import uvicorn
import sqlite3
import json
import math
import time
import os

app = FastAPI(title="Mosquito Mayhem Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.path.dirname(__file__), "mosquito_mayhem.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            kills INTEGER NOT NULL,
            misses INTEGER NOT NULL,
            accuracy REAL NOT NULL,
            best_streak INTEGER NOT NULL,
            rank_title TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("SELECT COUNT(*) FROM leaderboard")
    if cursor.fetchone()[0] == 0:
        defaults = [
            ("CLAP_GOD", 48, 3, 94.1, 16, "🦟 MOSQUITO DESTROYER"),
            ("SPEED_SWATTER", 36, 6, 85.7, 12, "👏 PROFESSIONAL CLAPPER"),
            ("CYBER_CLAPPER", 27, 4, 87.1, 9, "🎯 AMATEUR EXTERMINATOR"),
            ("MOSQUITO_FOOD", 12, 10, 54.5, 4, "🦟 MOSQUITO FOOD")
        ]
        for name, k, m, acc, streak, rank in defaults:
            cursor.execute("""
                INSERT INTO leaderboard (username, kills, misses, accuracy, best_streak, rank_title)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name, k, m, acc, streak, rank))
        conn.commit()
    conn.close()

def get_leaderboard(limit=10):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT username, kills, misses, accuracy, best_streak, rank_title, timestamp
        FROM leaderboard ORDER BY kills DESC, accuracy DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "username": r[0], "kills": r[1], "misses": r[2],
            "accuracy": r[3], "best_streak": r[4], "rank_title": r[5], "timestamp": r[6]
        }
        for r in rows
    ]

def add_score(name, kills, misses, accuracy, streak, rank):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO leaderboard (username, kills, misses, accuracy, best_streak, rank_title)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (name, kills, misses, accuracy, streak, rank))
    conn.commit()
    conn.close()
    return get_leaderboard(10)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/status")
def status():
    return {"status": "ONLINE", "engine": "FastAPI 0.141 Python Engine", "version": "2.0 Ultra"}

@app.get("/api/leaderboard")
def leaderboard_api():
    return {"leaderboard": get_leaderboard(10)}

@app.post("/api/score")
async def score_api(request: Request):
    data = await request.json()
    board = add_score(
        data.get("username", "PLAYER"),
        int(data.get("kills", 0)),
        int(data.get("misses", 0)),
        float(data.get("accuracy", 100.0)),
        int(data.get("best_streak", 0)),
        data.get("rank_title", "EX-TERMINATOR")
    )
    return {"status": "SUCCESS", "leaderboard": board}

@app.websocket("/ws/game")
async def game_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            m_type = msg.get("type")
            if m_type == "PING":
                await websocket.send_json({"type": "PONG", "ts": msg.get("ts")})
            elif m_type == "CLAP_EVENT":
                await websocket.send_json({"type": "CLAP_CONFIRMED", "intensity": msg.get("intensity", 0.9)})
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))

@app.get("/")
def index():
    return FileResponse(os.path.join(ROOT_DIR, "index.html"))

app.mount("/", StaticFiles(directory=ROOT_DIR, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
