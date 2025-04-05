import { NextRequest, NextResponse } from "next/server";
import { ReadPlayers } from "@/app/services/registerPlayersService/readPlayers";

export async function GET() {
    const res = await ReadPlayers();
    return NextResponse.json(res);
}
