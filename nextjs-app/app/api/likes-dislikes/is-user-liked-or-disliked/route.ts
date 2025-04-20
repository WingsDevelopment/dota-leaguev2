
import { NextResponse } from "next/server";
import { isUserLikedOrDislikedByOtherUser } from "@/app/services/likesAndDislikesService/isUserLikedOrDisliked";

export async function GET(req: Request) {

    const url = new URL(req.url);
    const otherPlayerSteamId = String(url.searchParams.get("otherPlayerSteamId"));
    const userSteamId = String(url.searchParams.get("userSteamId"));
    return NextResponse.json(await isUserLikedOrDislikedByOtherUser({ userSteamId, otherPlayerSteamId }))
}