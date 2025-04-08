import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { setDeclinePlayers } from "@/app/services/registerPlayersService/declinePlayers";


export async function POST(req: NextRequest) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { registrationId, requestType } = await req.json();
  
  const res = await setDeclinePlayers({ registrationId, requestType });
  return NextResponse.json(res);

}
