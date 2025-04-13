// app/api/import-players/route.ts
import { isUserAdmin } from "@/app/common/constraints";
import { ImportPlayers } from "@/app/services/playerService/importPlayers";
import { NextRequest, NextResponse } from "next/server";
import { getUnauthorizedError } from "../../common/functions";

export async function POST(request: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError()
  }

  const { leaderboard } = await request.json();
  return NextResponse.json(await ImportPlayers({ leaderboard }))
}
