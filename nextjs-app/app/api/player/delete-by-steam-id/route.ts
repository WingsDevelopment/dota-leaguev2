import { deletePlayerBySteamId } from "@/app/services/playerService/deletePlayerBySteamId";
import { NextResponse } from "next/server";
import { isUserAdmin } from "../../../common/constraints";
import { getUnauthorizedError } from "../../common/functions";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const steam_id = searchParams.get("steam_id");

 return NextResponse.json(await deletePlayerBySteamId({ steam_id }))
}
