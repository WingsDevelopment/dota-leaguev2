// Import necessary utilities
import { MatchHistory } from "@/app/services/matchHistoryService/matchHistory";
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
    const res = await MatchHistory({steamId})
    closeDatabase(db);
    return NextResponse.json(res);
  } catch (error) {
    closeDatabase(db);
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
