import { NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";
import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";

export async function GET() {
  const db = await getDbInstance();

  try {
    const matchHistory: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(
          `SELECT id, match_id, league_id, start_time, duration, game_mode, lobby_type, region, winner, radiant_score, dire_score, additional_info
           FROM MatchHistory`,
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

    closeDatabase(db);

    return NextResponse.json({ matchHistory });
  } catch (error) {
    closeDatabase(db);
    console.error("Error reading match history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
