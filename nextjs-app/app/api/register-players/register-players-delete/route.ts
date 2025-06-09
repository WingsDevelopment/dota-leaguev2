import { NextRequest, NextResponse } from "next/server";
import { DeletePlayers } from "@/app/services/registerPlayersService/deletePlayers";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steam_id = searchParams.get("steam_id");

  const res = await DeletePlayers({ steam_id });
  return NextResponse.json(res);
}
