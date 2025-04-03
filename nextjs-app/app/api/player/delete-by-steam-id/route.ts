import { closeDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";

export async function DELETE(req: Request) {
  // Parse the URL to get the query parameter:

  const body = await req.json()
  const { steamId } = body;
  if (!steamId) {
    return NextResponse.json(
      { error: "No steam_id provided" },
      { status: 400 }
    );
  }
  console.log(steamId,"steam id")
  const db = await getDbInstance();
  // Use the environment variable if set, else default to "db/league.db"

  try {
    const changes = await new Promise<number>((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION;");

        let totalChanges = 0; 

        db.run("DELETE FROM Players WHERE steam_id = ?", [steamId], function (err) {
          if (err) {
            console.error("Error deleting player from Players table:", err);
            return reject(err);
          }
          totalChanges += this.changes; 
        });

        db.run("DELETE FROM RegisterPlayers WHERE steam_id = ?", [steamId], function (err) {
          if (err) {
            console.error("Error deleting player from RegisterPlayers table:", err);
            return reject(err);
          }
          totalChanges += this.changes; 
        });

        db.run("COMMIT;", function (err) {
          if (err) {
            console.error("Error committing transaction:", err);
            return reject(err);
          }
          resolve(totalChanges);
        });
      });
    });

    if (changes === 0) {
      closeDatabase(db);
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    closeDatabase(db);
    return NextResponse.json({ success: true, message: "Player deleted successfully" });
  } catch (error) {
    closeDatabase(db);
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
