import { NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";

export async function POST() {
  try {
    const dbPath =
      process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

    // Open the SQLite database.
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error("Error opening database:", err);
        throw new Error("Database connection failed");
      }
    });

    // Execute update query wrapped in a promise
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE SteamBots SET status = 0 WHERE id = ?`,
        [1],
        function (err) {
          if (err) {
            console.error("Error updating bot status:", err);
            return reject(err);
          }
          resolve();
        }
      );
    });

    // Close the database connection.
    db.close();

    return NextResponse.json({
      success: true,
      message: "Bot status updated to 0",
    });
  } catch (error) {
    console.error("Error updating bot status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
