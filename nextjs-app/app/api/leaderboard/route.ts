import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

export async function GET() {
  try {
    // Use the environment variable if set.
    const dbPath =
      process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

    // Ensure the directory exists.
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log("Created directory:", dbDir);
    }

    // Open the SQLite database.
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

    // Execute the leaderboard query.
    const leaderboard: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(
          `SELECT discord_id, mmr
           FROM Players
           ORDER BY mmr DESC
           LIMIT 10`,
          [],
          (err, rows) => {
            if (err) {
              console.error("Error executing query:", err);
              return reject(err);
            }
            resolve(rows as any);
          }
        );
      }
    );

    // Close the database connection.
    db.close();

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error reading leaderboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
