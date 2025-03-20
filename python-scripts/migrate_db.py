import sqlite3
import os
from discord_db import (
    create_match_history_table,
    create_match_player_stats_table,
)
 
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))

def create_migrations_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS migrations (
            migration_name TEXT PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

def migration_already_applied(cursor, migration_name):
    cursor.execute("SELECT COUNT(*) FROM migrations WHERE migration_name = ?", (migration_name,))
    return cursor.fetchone()[0] > 0

def record_migration(cursor, migration_name):
    cursor.execute("INSERT INTO migrations (migration_name) VALUES (?)", (migration_name,))

def add_game_started_at_migration(cursor):
    cursor.execute("PRAGMA table_info(Game)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'game_started_at' not in columns:
        cursor.execute("ALTER TABLE Game ADD COLUMN game_started_at TIMESTAMP")
        print("Migration applied: Added 'game_started_at' column.")
    else:
        print("No migration needed: 'game_started_at' column already exists.")

def add_game_created_at_migration(cursor):
    cursor.execute("PRAGMA table_info(Game)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'game_created_at' not in columns:
        cursor.execute("ALTER TABLE Game ADD COLUMN game_created_at TIMESTAMP")
        print("Migration applied: Added 'game_created_at' column without default.")
        cursor.execute("UPDATE Game SET game_created_at = CURRENT_TIMESTAMP WHERE game_created_at IS NULL")
        print("Existing rows updated with CURRENT_TIMESTAMP for 'game_created_at'.")
    else:
        print("No migration needed: 'game_created_at' column already exists.")

def add_banned_until_migration(cursor):
    cursor.execute("PRAGMA table_info(Players)")
    columns = [col[1] for col in cursor.fetchall()]
    new_columns = {
        "banned_until": "DATE",
        "games_left": "INTEGER DEFAULT 0",
        "games_griefed": "INTEGER DEFAULT 0",
        "bbb": "INTEGER DEFAULT 0"
    }
    for column, column_type in new_columns.items():
        if column not in columns:
            cursor.execute(f"ALTER TABLE Players ADD COLUMN {column} {column_type}")
            print(f"Migration applied: Added '{column}' column with type {column_type}.")
        else:
            print(f"No migration needed: '{column}' column already exists.")

def add_games_didnt_show_migration(cursor):
    cursor.execute("PRAGMA table_info(Players)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'games_didnt_show' not in columns:
        cursor.execute("ALTER TABLE Players ADD COLUMN games_didnt_show INTEGER DEFAULT 0")
        print("Migration applied: Added 'games_didnt_show' column with default 0.")
        cursor.execute("UPDATE Players SET games_didnt_show = 0 WHERE games_didnt_show IS NULL")
        print("Existing rows updated with 0 for 'games_didnt_show'.")
    else:
        print("No migration needed: 'games_didnt_show' column already exists.")

def create_match_history_table_migration(cursor):
    # Reuse the function from discord_db.py
    create_match_history_table(cursor)
    print("Migration applied: Created MatchHistory table.")

def create_match_player_stats_table_migration(cursor):
    # Reuse the function from discord_db.py
    create_match_player_stats_table(cursor)
    print("Migration applied: Created MatchPlayerStats table.")

def run_migrations(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    create_migrations_table(cursor)
    
    # List of migrations as (migration_name, migration_function)
    migrations = [
        ("add_game_created_at", add_game_created_at_migration),
        ("add_game_started_at", add_game_started_at_migration),
        ("create_match_history_table", create_match_history_table_migration),
        ("create_match_player_stats_table", create_match_player_stats_table_migration),
        ("add_banned_until", add_banned_until_migration),
        ("add_games_didnt_show",add_games_didnt_show_migration),
    ]
    
    for migration_name, migration_func in migrations:
        if not migration_already_applied(cursor, migration_name):
            migration_func(cursor)
            record_migration(cursor, migration_name)
            conn.commit()
        else:
            print(f"Skipping migration '{migration_name}'; already applied.")
    conn.close()

if __name__ == "__main__":
    run_migrations(DB_PATH)
