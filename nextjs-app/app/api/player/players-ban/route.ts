import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { banPlayer } from "@/app/services/playerService/banPlayer";
import { getUnauthorizedError } from "../../common/functions";

export async function POST(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError()
  }

  const { steam_id, banType } = await req.json();

  return NextResponse.json(await banPlayer({
    steam_id,
    banType,
  }));

}
