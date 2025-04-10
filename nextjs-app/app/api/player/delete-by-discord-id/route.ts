import { deletePlayerByDiscordId } from "@/app/services/playerService/deletePlayerByDiscordId";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  // Parse the URL to get the query parameter:
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get("discord_id");

 return NextResponse.json(await deletePlayerByDiscordId({ discordId }))
}
