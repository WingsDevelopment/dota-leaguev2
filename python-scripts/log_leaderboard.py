
#!/usr/bin/env python3
import sqlite3
import os

# Determine the base directory and database path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))

def get_leaderboards(cursor):
    query = """
    SELECT discord_id, mmr
    FROM Players
    ORDER BY mmr DESC
    """
    cursor.execute(query)
    return cursor.fetchall()

def main():
    # Connect to the database
    conn = sqlite3.connect(DB_PATH, uri=True)
    cursor = conn.cursor()
    
    leaderboard = get_leaderboards(cursor)
    conn.close()
    
    if leaderboard:
        print("Leaderboard (Players sorted by MMR):")
        for rank, (discord_id, mmr) in enumerate(leaderboard, start=1):
            print(f"{rank}. Discord ID: {discord_id}, MMR: {mmr}")
    else:
        print("No leaderboard data found.")

if __name__ == '__main__':
    main()
