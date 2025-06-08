import { deletePlayerByDiscordId } from "@/app/services/playerService/deletePlayerByDiscordId";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get("discordId");
 return NextResponse.json(await deletePlayerByDiscordId({ discordId }))
}
