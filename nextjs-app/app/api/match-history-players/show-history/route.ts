import { getMatchHistory } from "@/app/services/matchHistoryService/getMatchHistory";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const steamId = url.searchParams.get("steamId");

    const res = await getMatchHistory({steamId})
    return NextResponse.json(res);
}

