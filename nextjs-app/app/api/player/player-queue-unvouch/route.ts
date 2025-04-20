import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { queueUnvouchPlayer } from "@/app/services/playerService/queueUnvouchPlayer";
import { getUnauthorizedError } from "../../common/functions";

export async function POST(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }
  const { steam_id, vouchLevel } = await req.json();
  const result = await queueUnvouchPlayer({ steam_id, vouchLevel });
  return NextResponse.json(result);
}
