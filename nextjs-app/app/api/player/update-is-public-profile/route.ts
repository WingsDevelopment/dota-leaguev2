import { NextRequest, NextResponse } from "next/server";
import { UpdateIsPlayerProfilePublic } from "@/app/services/playerService/updateIsPublicProfile";

export async function POST(req: NextRequest) {
    const { checked, discord_id } = await req.json()
    return NextResponse.json(await UpdateIsPlayerProfilePublic({ checked,discord_id }));
}