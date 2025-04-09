import { NextRequest, NextResponse } from "next/server";
import { closeDatabase } from "@/db/initDatabase";
import { getPlayerBySteamId } from "@/app/services/playerService/getPlayerBySteamId";
import { getPlayerSteamIdByDiscordId } from "@/app/services/playerService/getPlayerSteamIdByDiscordId";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get("discordId");
  return NextResponse.json(await getPlayerSteamIdByDiscordId({ discordId }))
}
