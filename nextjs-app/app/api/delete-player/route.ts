import { NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";

export async function DELETE(request: Request) {
  // Parse the URL to get the query parameter:
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get("discord_id");

  if (!discordId) {
    return NextResponse.json(
      { error: "No discord_id provided" },
      { status: 400 }
    );
  }

  // Use the environment variable if set, else default to "db/league.db"
  const dbPath =
    process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

  // Open the SQLite database:
  const db = await new Promise<sqlite3.Database>((resolve, reject) => {
    const instance = new sqlite3.Database(
      dbPath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          console.error("Error opening database:", err);
          return reject(err);
        }
        resolve(instance);
      }
    );
  });

  try {
    // Perform the DELETE operation:
    const changes: number = await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM Players WHERE discord_id = ?",
        [discordId],
        function (err: Error | null) {
          if (err) {
            console.error("Error deleting player:", err);
            return reject(err);
          }
          // 'this' context from sqlite3.run() has metadata about the statement
          // 'this.changes' has the number of rows affected.
          resolve(this.changes);
        }
      );
    });

    db.close();

    // If no rows were deleted, return a 404
    if (changes === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Otherwise, return success
    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    db.close();
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
