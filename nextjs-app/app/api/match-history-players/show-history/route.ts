// Import necessary utilities
import { closeDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { NextResponse } from "next/server";

// GET matches based on steam_id
export async function GET(req: Request) {
  const db = await getDbInstance();

  try {
    // Extract steam_id from URL params
    const url = new URL(req.url);
    const steamId = url.searchParams.get("steam_id");

    if (!steamId) {
      return NextResponse.json({ error: "Missing steam_id parameter" }, { status: 400 });
    }

    // Fetch match details and player stats in a single query
    const matchHistory: Array<Record<string, any>> = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
            mh.id, mh.match_id, mh.league_id, mh.start_time, mh.duration, mh.game_mode, 
            mh.lobby_type, mh.region, mh.winner, mh.radiant_score, mh.dire_score, mh.additional_info,
            mps.hero_id, mps.kills, mps.deaths, mps.assists, mps.items
         FROM MatchHistory mh
         JOIN MatchPlayerStats mps ON mh.id = mps.match_history_id
         WHERE mps.steam_id = ?`,
        [steamId],
        (err, rows) => {
          if (err) {
            console.error("Error fetching match history:", err);
            return reject(err);
          }
          resolve(rows as any);
        }
      );
    });

    closeDatabase(db);
    return NextResponse.json({ matchHistory });
  } catch (error) {
    closeDatabase(db);
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
