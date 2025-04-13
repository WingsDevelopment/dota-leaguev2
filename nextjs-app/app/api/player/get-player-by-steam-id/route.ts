import { NextRequest, NextResponse } from "next/server";
import { closeDatabase } from "@/db/initDatabase";
import { getPlayerBySteamId } from "@/app/services/playerService/getPlayerBySteamId";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steam_id = searchParams.get("steam_id");
  return NextResponse.json(await getPlayerBySteamId({ steam_id }))
}
