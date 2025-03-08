import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { auth, ExtendedUser } from "../../../../auth";
import { closeDatabase } from "@/db/initDatabase";

export async function PUT(req: NextRequest) {
  const { steam_id, mmr } = await req.json();
  const session = await auth();
  const { discordId, name } = (session?.user || {}) as ExtendedUser;
  if (!steam_id || !mmr) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const db = await getDbInstance();
  try {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS RegisterPlayers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          status TEXT NOT NULL,
          steam_id TEXT NOT NULL UNIQUE,
          discord_id TEXT NOT NULL,
          name TEXT NOT NULL,
          mmr INTEGER NOT NULL
        )`,
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // 1️⃣ Check if steam_id exists in Players table
    const playerExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id FROM Players WHERE steam_id = ?",
        [steam_id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (playerExists) {
      
      return NextResponse.json({
        message: "Player already exists in Players table, no action needed.",
      });
    }

    // 2️⃣ Insert new player into RegisterPlayers table
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO RegisterPlayers (status, steam_id, discord_id, name, mmr) VALUES (?, ?, ?, ?, ?)`,
        ["PENDING", steam_id, discordId, name, 1000],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    
    return NextResponse.json({
      message: "Player added to RegisterPlayers with status PENDING.",
    });
  } catch (error) {
    
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: `Internal Server Error ${error}` },
      { status: 500 }
    );
  }finally{
    closeDatabase(db);
  }
}
