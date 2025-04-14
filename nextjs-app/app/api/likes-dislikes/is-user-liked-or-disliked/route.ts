
import { NextResponse } from "next/server";
import { isUserLikedOrDisliked } from "@/app/services/likesAndDislikesService/isUserLikedOrDisliked";

export async function GET(req: Request) {

    const url = new URL(req.url);
    const otherPlayerSteamId = String(url.searchParams.get("otherPlayerSteamId"));
    const userSteamId = String(url.searchParams.get("userSteamId"));
    console.log(userSteamId, otherPlayerSteamId,"INFO IN ROUTE")
    return NextResponse.json(await isUserLikedOrDisliked({ userSteamId, otherPlayerSteamId }))
}