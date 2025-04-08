import { NextRequest, NextResponse } from "next/server";
import { closeDatabase } from "@/db/initDatabase";
import { getPlayerBySteamId } from "@/app/services/playerService/getPlayerBySteamId";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");
  return NextResponse.json(await getPlayerBySteamId({ steamId }))
}
