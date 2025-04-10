// app/api/import-players/route.ts
import { ImportPlayers } from "@/app/services/playerService/importPlayers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { leaderboard } = await request.json();
  return NextResponse.json(await ImportPlayers({ leaderboard }))
}
