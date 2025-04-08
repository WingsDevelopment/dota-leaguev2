import { NextRequest, NextResponse } from "next/server";
import { getRegisterPlayers } from "@/app/services/registerPlayersService/readPlayers";
import { isUserAdmin } from "../../../common/constraints";
import { getUnauthorizedError } from "../../common/functions";

export async function GET() {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }
  const res = await getRegisterPlayers();
  return NextResponse.json(res);
}
