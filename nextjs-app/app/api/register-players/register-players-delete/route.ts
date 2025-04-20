import { NextRequest, NextResponse } from "next/server";
import { DeletePlayers } from "@/app/services/registerPlayersService/deletePlayers";
import { isUserAdmin } from "../../../common/constraints";
import { getUnauthorizedError } from "../../common/functions";

export async function DELETE(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }

  const { searchParams } = new URL(req.url);
  const steam_id = searchParams.get("steam_id");

  const res = await DeletePlayers({ steam_id });
  return NextResponse.json(res);
}
