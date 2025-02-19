import sqlite3

DB_PATH = 'db/league.db'

conn = sqlite3.connect(DB_PATH, uri=True)
cursor = conn.cursor()

# Update the SteamBots table to set status=0 for the bot with id 1
cursor.execute("UPDATE SteamBots SET status = 0 WHERE id = ?", (1,))
conn.commit()
conn.close()

print("Bot status updated to 0.")
