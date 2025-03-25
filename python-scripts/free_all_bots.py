import sqlite3
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))

conn = sqlite3.connect(DB_PATH, uri=True)
cursor = conn.cursor()

# Update all rows in SteamBots table to set status = 0
cursor.execute("UPDATE SteamBots SET status = 0")
conn.commit()
conn.close()

print("All bots status updated to 0.")
