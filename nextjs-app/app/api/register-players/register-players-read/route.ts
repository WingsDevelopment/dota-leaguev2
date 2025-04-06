import { NextRequest, NextResponse } from "next/server";
import { getRegisterPlayers } from "@/app/services/registerPlayersService/readPlayers";

export async function GET() {
    const res = await getRegisterPlayers();
    return NextResponse.json(res);
}
