import { deletePlayerBySteamId } from "@/app/services/playerService/deletePlayerBySteamId";
import { NextResponse } from "next/server";
import { isUserAdmin } from "../../../common/constraints";
import { getUnauthorizedError } from "../../common/functions";

export async function DELETE(request: Request) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }

  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get("steam_id") || undefined;

  return NextResponse.json(await deletePlayerBySteamId({ steamId }));
}
