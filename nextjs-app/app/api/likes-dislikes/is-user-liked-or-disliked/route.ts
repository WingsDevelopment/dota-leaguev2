
import { NextResponse } from "next/server";
import { isUserLikedOrDisliked } from "@/app/services/likesAndDislikesService/isUserLikedOrDisliked";

export async function GET(req: Request) {

    const url = new URL(req.url);
    const otherPlayerSteamId = String(url.searchParams.get("steam_id"));
    const userSteamId = String(url.searchParams.get("user_steam_id"));
    console.log(userSteamId, otherPlayerSteamId,'aaaaaaaaaaa')
    if (!otherPlayerSteamId) {
        return NextResponse.json({ error: "Missing steam ID" }, { status: 400 });
    }

    const res = await isUserLikedOrDisliked({ userSteamId,otherPlayerSteamId  });
    return NextResponse.json(res);
}