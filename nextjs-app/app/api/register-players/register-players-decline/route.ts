import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { setDeclinePlayers } from "@/app/services/registerPlayersService/declinePlayers";
import { getUnauthorizedError } from "../../common/functions";

export async function POST(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }
  const { registrationId, requestType } = await req.json();

  const res = await setDeclinePlayers({ registrationId, requestType });
  return NextResponse.json(res);

}
