import { NextRequest, NextResponse } from "next/server";
import { putLikesAndDislikes } from "@/app/services/likesAndDislikesService/likesAndDislikes";
import { apiCallerPutLikeOrDislike } from "./caller";

export async function POST(req: Request) {

  const { userSteamId, otherPlayerSteamId, type } = await req.json()

  return NextResponse.json(await putLikesAndDislikes({ userSteamId, otherPlayerSteamId, type }));

}
