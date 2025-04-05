import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { auth } from "../../../../auth";
import { closeDatabase } from "@/db/initDatabase";
import { ApprovePlayers } from "@/app/services/registerPlayersService/approvePlayers";

export async function POST(req: NextRequest) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { registrationId, requestType } = await req.json();
  if (!registrationId || !requestType) {
    return NextResponse.json(
      { error: "Missing registrationId or requestType" },
      { status: 400 }
    );
  }
  
  const res = await ApprovePlayers({ registrationId, requestType });
  return NextResponse.json(res);

}
