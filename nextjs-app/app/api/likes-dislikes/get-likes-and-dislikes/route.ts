import { NextRequest, NextResponse } from "next/server";
import { getPlayerLikesAndDislikes } from "@/app/services/likesAndDislikesService/getLikesAndDislikes";

export async function GET(req: Request) {

  const url = new URL(req.url);
  const steamId =String(url.searchParams.get("steam_id"));

  const res = await getPlayerLikesAndDislikes({ steamId });
  return NextResponse.json(res);
}
