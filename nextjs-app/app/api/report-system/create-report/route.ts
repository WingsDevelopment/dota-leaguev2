import { NextRequest, NextResponse } from "next/server";
import { createUserReport } from "@/app/services/userReport/createUserReport";

export async function PUT(req: NextRequest) {

    const { user_steam_id, other_player_steam_id, type, report, match_id } = await req.json();
    const res = await createUserReport({ user_steam_id, other_player_steam_id, type, report, match_id });
    return NextResponse.json(res);

}
