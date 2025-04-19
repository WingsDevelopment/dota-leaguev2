import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { queueVouchPlayer } from "@/app/services/playerService/queueVouchPlayer";
import { getUnauthorizedError } from "../../common/functions";

export async function POST(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }
  const { steam_id, vouchLevel } = await req.json();
  const result = await queueVouchPlayer({ steam_id, vouchLevel });
  return NextResponse.json(result);
}
