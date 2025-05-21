import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { auth } from "../../../../auth";
import { closeDatabase } from "@/db/initDatabase";
import { setApprovePlayers } from "@/app/services/registerPlayersService/approvePlayers";
import { getUnauthorizedError } from "../../common/functions";


export async function POST(req: NextRequest) {
    if (!(await isUserAdmin())) {
      return getUnauthorizedError();
    }
  const { registrationId, requestType } = await req.json();
  
  const res = await setApprovePlayers({ registrationId, requestType });
  return NextResponse.json(res);

}
