// app/api/import-players/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";

export async function POST(request: NextRequest) {
  try {
    // Parse incoming JSON
    const { leaderboard } = await request.json();
    if (!Array.isArray(leaderboard)) {
      return NextResponse.json(
        { error: "Missing or invalid leaderboard array" },
        { status: 400 }
      );
    }

    // Open the DB
    const dbPath =
      process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");
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

    // Insert each player
    for (const player of leaderboard) {
      // Convert to string so that large numbers aren’t truncated by JS
      const discordIdStr = String(player.discord_id);
      const steamIdStr = String(player.steam_id);

      // MMR can remain an integer if you prefer
      const mmrValue = player.mmr ? Number(player.mmr) : 1000;

      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO Players (discord_id, steam_id, name, mmr)
           VALUES (?, ?, ?, ?)`,
          [discordIdStr, steamIdStr, player.name, mmrValue],
          function (err) {
            if (err) {
              console.error("Error inserting player:", err);
              return reject(err);
            }
            resolve();
          }
        );
      });
    }

    db.close();
    return NextResponse.json({ message: "Imported leaderboard successfully." });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
