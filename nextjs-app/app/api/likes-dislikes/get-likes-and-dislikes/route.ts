import { NextRequest, NextResponse } from "next/server";
import { closeDatabase } from "@/db/initDatabase";
import { getPlayerBySteamId } from "@/app/services/playerService/getPlayerBySteamId";
import { getPlayerLikesAndDislikes } from "@/app/services/likesAndDislikesService/getLikesAndDislikes";

export async function GET(req: Request) {

  const url = new URL(req.url);
  const steamId =String(url.searchParams.get("steam_id"));

  if (!steamId) {
    return NextResponse.json({ error: "Missing steam ID" }, { status: 400 });
  }

  const res = await getPlayerLikesAndDislikes({ steamId });
  return NextResponse.json(res);
}
