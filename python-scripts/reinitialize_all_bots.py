import sqlite3
import os
import json

# Determine base directory and database path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))

# Path to the JSON file containing bot account information.
# Adjust the path as needed. Here we assume it's in the same directory as this script.
JSON_PATH = os.path.join(os.path.dirname(__file__), "steam_bot_acc.json")

# Connect to the database
conn = sqlite3.connect(DB_PATH, uri=True)
cursor = conn.cursor()

# Delete all existing records from the SteamBots table
cursor.execute("DELETE FROM SteamBots")
conn.commit()
print("Deleted all existing bots from the database.")

# Load bot accounts from the JSON file
with open(JSON_PATH, "r") as f:
    bot_accounts = json.load(f)

# Insert each bot into the SteamBots table.
# Adjust the INSERT statement below if your table has additional columns.
for bot in bot_accounts:
    username = bot.get("username")
    password = bot.get("password")
    # Set the bot's status to 0 (free) upon reinitialization.
    cursor.execute(
        "INSERT INTO SteamBots (username, password, status) VALUES (?, ?, ?)",
        (username, password, 0)
    )

conn.commit()
conn.close()

print(f"Reinitialized {len(bot_accounts)} bot(s) from {JSON_PATH}.")
