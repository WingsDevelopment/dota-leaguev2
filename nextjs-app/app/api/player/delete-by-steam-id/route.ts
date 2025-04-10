import { deletePlayerBySteamId } from "@/app/services/playerService/deletePlayerBySteamId";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get("steam_id");

 return NextResponse.json(await deletePlayerBySteamId({ steamId }))
}
