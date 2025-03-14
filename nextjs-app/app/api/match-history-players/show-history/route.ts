import { closeDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { NextResponse } from "next/server";

//Dodati transakcije i napraviti service.
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

    // First, get match_history_id(s) for this player
    const matchHistoryIds: Array<{ match_history_id: number }> = await new Promise(
      (resolve, reject) => {
        db.all(
          `SELECT match_history_id FROM MatchPlayerStats WHERE steam_id = ?`,
          [steamId],
          (err, rows) => {
            if (err) {
              console.error("Error fetching match_history_id:", err);
              return reject(err);
            }
            resolve(rows as any);
          }
        );
      }
    );

    if (matchHistoryIds.length === 0) {
      closeDatabase(db);
      return NextResponse.json({ matchHistory: [] }); // No matches found
    }

    // Extract IDs for SQL query
    const matchIds = matchHistoryIds.map((row) => row.match_history_id);

    // Fetch match details based on match_history_id
    const matchHistory: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(
          `SELECT id, match_id, league_id, start_time, duration, game_mode, 
                  lobby_type, region, winner, radiant_score, dire_score, additional_info
           FROM MatchHistory 
           WHERE id IN (${matchIds.map(() => "?").join(",")})`,
          matchIds,
          (err, rows) => {
            if (err) {
              console.error("Error fetching match history:", err);
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
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}