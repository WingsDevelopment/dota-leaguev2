import sqlite3
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "db", "league.db"))

def create_migrations_table(cursor):
    # Create a table to track applied migrations if it doesn't already exist.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS migrations (
            migration_name TEXT PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

def migration_already_applied(cursor, migration_name):
    # Check if the migration has already been applied.
    cursor.execute("SELECT COUNT(*) FROM migrations WHERE migration_name = ?", (migration_name,))
    return cursor.fetchone()[0] > 0

def record_migration(cursor, migration_name):
    # Record that a migration has been applied.
    cursor.execute("INSERT INTO migrations (migration_name) VALUES (?)", (migration_name,))

def add_game_started_at_migration(cursor):
    # Check if the column 'game_started_at' already exists.
    cursor.execute("PRAGMA table_info(Game)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'game_started_at' not in columns:
        # Use ALTER TABLE to add the new column without affecting existing data.
        cursor.execute("ALTER TABLE Game ADD COLUMN game_started_at TIMESTAMP")
        print("Migration applied: Added 'game_started_at' column.")
    else:
        print("No migration needed: 'game_started_at' column already exists.")

def add_game_created_at_migration(cursor):
    cursor.execute("PRAGMA table_info(Game)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'game_created_at' not in columns:
        cursor.execute("ALTER TABLE Game ADD COLUMN game_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        print("Migration applied: Added 'game_created_at' column.")
    else:
        print("No migration needed: 'game_created_at' column already exists.")


def run_migrations(db_path):
    # Connect to the database.
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Ensure the migrations table exists.
    create_migrations_table(cursor)

    # List of migrations in order: (migration_name, migration_function)
    migrations = [
        ("add_game_created_at", add_game_created_at_migration),
        ("add_game_started_at", add_game_started_at_migration),
        # You can add more migrations here as needed.
    ]

    # Apply any pending migrations.
    for migration_name, migration_func in migrations:
        if not migration_already_applied(cursor, migration_name):
            migration_func(cursor)
            record_migration(cursor, migration_name)
            conn.commit()  # Commit each migration separately.
        else:
            print(f"Skipping migration '{migration_name}'; already applied.")

    # Close the connection.
    conn.close()

if __name__ == "__main__":
    run_migrations(DB_PATH)
