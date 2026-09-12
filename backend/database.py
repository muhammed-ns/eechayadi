"""
database.py
SQLite database manager for Mosquito Mayhem high scores, leaderboards, and match history.
"""
import sqlite3
import os
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(__file__), "mosquito_mayhem.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Leaderboard table
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

    # Default hall-of-fame entries if empty
    cursor.execute("SELECT COUNT(*) FROM leaderboard")
    if cursor.fetchone()[0] == 0:
        default_scores = [
            ("CLAP_LEGEND", 42, 5, 89.3, 14, "👏 PROFESSIONAL CLAPPER"),
            ("BUG_MENACE", 35, 8, 81.3, 11, "👏 PROFESSIONAL CLAPPER"),
            ("SWAT_KING", 28, 4, 87.5, 9, "🎯 AMATEUR EXTERMINATOR"),
            ("MOSQUITO_MENACE", 19, 7, 73.0, 6, "🎯 AMATEUR EXTERMINATOR"),
            ("NOOB_SWATTER", 8, 12, 40.0, 3, "🦟 MOSQUITO FOOD")
        ]
        for name, k, m, acc, streak, rank in default_scores:
            cursor.execute("""
                INSERT INTO leaderboard (username, kills, misses, accuracy, best_streak, rank_title)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name, k, m, acc, streak, rank))
        conn.commit()

    conn.close()

def get_top_leaderboard(limit=10):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT username, kills, misses, accuracy, best_streak, rank_title, timestamp
        FROM leaderboard
        ORDER BY kills DESC, accuracy DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "username": r[0],
            "kills": r[1],
            "misses": r[2],
            "accuracy": r[3],
            "best_streak": r[4],
            "rank_title": r[5],
            "timestamp": r[6]
        }
        for r in rows
    ]

def submit_score(username, kills, misses, accuracy, best_streak, rank_title):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO leaderboard (username, kills, misses, accuracy, best_streak, rank_title)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (username, kills, misses, accuracy, best_streak, rank_title))
    conn.commit()
    conn.close()
    return get_top_leaderboard(10)
