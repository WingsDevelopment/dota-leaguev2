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
    const matchId = url.searchParams.get("match_history_id");

    if (!matchId) {
      return NextResponse.json({ error: "Missing steam_id parameter" }, { status: 400 });
    }

    // Fetch match details based on match_history_id
    const playerNames: Array<Record<string, any>> = await new Promise((resolve, reject) => {
        db.all(
          `SELECT p.name, p.steam_id
           FROM MatchPlayerStats mps
           JOIN Players p ON mps.steam_id = p.steam_id
           WHERE mps.match_history_id = ?`,
          [matchId],
          (err, rows) => {
            if (err) {
              console.error("Error executing query:", err);
              return reject(err);
            }
            resolve(rows as any);
          }
        );
      });

    closeDatabase(db);
    return NextResponse.json({ playerNames });
  } catch (error) {
    closeDatabase(db);
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}