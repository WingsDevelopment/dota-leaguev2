import { closeDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";

export async function DELETE(request: Request) {
  // Parse the URL to get the query parameter:
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get("steam_id");

  if (!steamId) {
    return NextResponse.json(
      { error: "No steam_id provided" },
      { status: 400 }
    );
  }
 const db = await getDbInstance();
  // Use the environment variable if set, else default to "db/league.db"

  try {
    // Perform the DELETE operation:
    const changes: number = await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM Players WHERE steam_id = ?",
        [steamId],
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

    

    // If no rows were deleted, return a 404
    if (changes === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Otherwise, return success
    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally{
    closeDatabase(db);
  }
}
