import { NextRequest, NextResponse } from "next/server";
import { getPlayerByDiscordId } from "@/app/services/playerService/getPlayerByDiscordId";

export async function GET(req: Request) {

  const url = new URL(req.url);
  const discordId =String(url.searchParams.get("discord_id"));
  if (!discordId) {
    return NextResponse.json({ error: "Missing steam ID" }, { status: 400 });
  }

  const res = await getPlayerByDiscordId({ discordId });
  return NextResponse.json(res);
}
