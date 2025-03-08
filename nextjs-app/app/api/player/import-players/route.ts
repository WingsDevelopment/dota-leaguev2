// app/api/import-players/route.ts
import { closeDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";

export async function POST(request: NextRequest) {
  const db = await getDbInstance();
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


    return NextResponse.json({ message: "Imported leaderboard successfully." });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    closeDatabase(db);
  }
}
