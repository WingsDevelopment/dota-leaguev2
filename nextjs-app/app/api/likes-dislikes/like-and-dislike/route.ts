import { NextRequest, NextResponse } from "next/server";
import { putLikesAndDislikes } from "@/app/services/likesAndDislikesService/likesAndDislikes";

export async function POST(req: Request) {

  const { userSteamId, otherPlayerSteamId, type } = await req.json()
  if (!userSteamId || !otherPlayerSteamId || !type) {
    return NextResponse.json({ error: "Missing Variable" }, { status: 400 });
  }

  const res = await putLikesAndDislikes({ userSteamId, otherPlayerSteamId, type });
  return NextResponse.json(res);
}
