import { NextRequest, NextResponse } from "next/server";
import { auth, ExtendedUser } from "../../../../auth";

import { CreatePlayers } from "@/app/services/registerPlayersService/createPlayers";

export async function PUT(req: NextRequest) {
  const { steam_id, mmr } = await req.json();
  const session = await auth();
  const { discordId, name } = (session?.user || {}) as ExtendedUser;

  const res = await CreatePlayers({ steam_id, mmr, name, discord_id:discordId });
    return NextResponse.json(res);
}
