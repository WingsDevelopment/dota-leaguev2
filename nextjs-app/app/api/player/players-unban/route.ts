import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { getUnauthorizedError } from "../../common/functions";
import { UnbanPlayer } from "@/app/services/playerService/unbanPlayer";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError()
  }
  const { steam_id } = await req.json();
  return NextResponse.json(await UnbanPlayer({
    steam_id
  }));
}
