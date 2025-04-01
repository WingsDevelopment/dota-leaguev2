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

def add_additional_player_table_columns(cursor):
    cursor.execute("PRAGMA table_info(Players)")
    columns = [col[1] for col in cursor.fetchall()]
    new_columns = {
        "likes": "INTEGER DEFAULT 0",
        "dislikes": "INTEGER DEFAULT 0",
        "is_public_profile": "BOOLEAN DEFAULT 1",
        "wins": "INTEGER DEFAULT 0",
        "loses": "INTEGER DEFAULT 0",
        "streak": "INTEGER DEFAULT 0",
        "vouched_date": "DATE",
    }
    for column, column_type in new_columns.items():
        if column not in columns:
            cursor.execute(f"ALTER TABLE Players ADD COLUMN {column} {column_type}")
            print(f"Migration applied: Added '{column}' column with type {column_type}.")
        else:
            print(f"No migration needed: '{column}' column already exists.")

def remove_likes_dislikes_players(cursor):
    cursor.execute("PRAGMA table_info(Players)")
    columns_info = cursor.fetchall()
    columns = [col[1] for col in columns_info]         
    if 'likes' in columns or 'dislikes' in columns:
        columns_to_keep = [col for col in columns_info if col[1] not in ['likes', 'dislikes']]
        column_definitions = ", ".join(f"{col[1]} {col[2]}" for col in columns_to_keep)
        cursor.execute(f"CREATE TABLE Players_new ({column_definitions});")
        columns_to_copy = [col[1] for col in columns_to_keep]
        columns_to_copy_str = ", ".join(columns_to_copy)
        cursor.execute(f"""
        INSERT INTO Players_new ({columns_to_copy_str})
        SELECT {columns_to_copy_str} FROM Players;
        """)
        cursor.execute("DROP TABLE Players;")
        cursor.execute("ALTER TABLE Players_new RENAME TO Players;")

        print("Migration applied: Removed 'likes' and 'dislikes' columns.")
    else:
        print("No migration needed: 'likes' and 'dislikes' columns do not exist.")

def create_like_dislike_table(cursor):
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS likeDislike (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        steam_id INTEGER DEFAULT NULL,
        likes_dislikes BOOLEAN DEFAULT NULL,
        other_player_steam_id INTEGER DEFAULT NULL
    );
    """)

    print("Migration applied: Created 'likeDislike' table if it did not exist.")

def create_match_history_table_migration(cursor):
    # Reuse the function from discord_db.py
    create_match_history_table(cursor)
    print("Migration applied: Created MatchHistory table.")

def create_match_player_stats_table_migration(cursor):
    # Reuse the function from discord_db.py
    create_match_player_stats_table(cursor)
    print("Migration applied: Created MatchPlayerStats table.")

def migrate_players_autoincrement(cursor):
    # Desired extra columns with definitions we want to enforce.
    desired_columns = {
        "is_public_profile": "BOOLEAN DEFAULT 1",
        "wins": "INTEGER DEFAULT 0",
        "loses": "INTEGER DEFAULT 0",
        "streak": "INTEGER DEFAULT 0",
        "vouched_date": "DATE",
    }

    # Fetch current table creation SQL
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='Players'")
    result = cursor.fetchone()

    # If the table's SQL already contains AUTOINCREMENT and all desired columns,
    # we may skip migration.
    if result and "AUTOINCREMENT" in result[0].upper():
        missing = [col for col in desired_columns if col not in result[0]]
        if not missing:
            print("No migration needed: Players table already uses AUTOINCREMENT and desired columns exist.")
            return

    print("Migrating Players table to update schema with AUTOINCREMENT and desired columns.")

    # Get current column info from the Players table.
    cursor.execute("PRAGMA table_info(Players)")
    columns_info = cursor.fetchall()  # Each row: (cid, name, type, notnull, dflt_value, pk)
    # Build a mapping of current columns for easy lookup.
    current_columns = {col[1]: col for col in columns_info}

    new_columns_def = []
    column_names = []

    # Rebuild definitions for columns that already exist.
    for col in columns_info:
        col_name = col[1]
        column_names.append(col_name)
        # For the id column, enforce AUTOINCREMENT.
        if col_name == "id":
            col_def = f"{col_name} INTEGER PRIMARY KEY AUTOINCREMENT"
        elif col_name in desired_columns:
            # Use our desired definition for these columns.
            col_def = f"{col_name} {desired_columns[col_name]}"
        else:
            col_type = col[2]
            notnull = "NOT NULL" if col[3] else ""
            default = f"DEFAULT {col[4]}" if col[4] is not None else ""
            col_def = f"{col_name} {col_type} {notnull} {default}".strip()
        new_columns_def.append(col_def)

    # Add any missing desired columns.
    for col, definition in desired_columns.items():
        if col not in current_columns:
            new_columns_def.append(f"{col} {definition}")
            # Note: we don't copy data for these columns (they'll use their default).

    columns_def_str = ", ".join(new_columns_def)

    # Create a new temporary table with the updated schema.
    cursor.execute(f"CREATE TABLE Players_new ({columns_def_str});")
    
    # Copy data from the existing Players table.
    # We only copy columns that exist in the old table.
    common_columns = list(current_columns.keys())
    common_columns_str = ", ".join(common_columns)
    cursor.execute(f"INSERT INTO Players_new ({common_columns_str}) SELECT {common_columns_str} FROM Players;")
    
    # Remove the old table and rename the new one.
    cursor.execute("DROP TABLE Players;")
    cursor.execute("ALTER TABLE Players_new RENAME TO Players;")
    
    print("Migration applied: Players table updated with AUTOINCREMENT and desired column defaults.")

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
        ("add_additional_player_table_columns",add_additional_player_table_columns),
        ("remove_likes_dislikes_players_columns",remove_likes_dislikes_players),
        ("create_like_dislike_table",create_like_dislike_table),
        ("migrate_players_autoincrement", migrate_players_autoincrement)
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
