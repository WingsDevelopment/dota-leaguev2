#!/usr/bin/env python3
import sys
import sqlite3
import os
from discord_db import reset_all_player_mmr


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))

def main():
    try:
        # Replace 'your_database_file.db' with your actual database file path.
        conn: Connection = sqlite3.connect(DB_PATH, uri=True)
        conn.execute('PRAGMA journal_mode=WAL')
        cursor: Cursor = conn.cursor()
        reset_all_player_mmr(cursor)
        conn.commit()
        print("reset_all_player_mmr executed successfully.")
    except Exception as e:
        print("Error reset_all_player_mmr:", e)
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
