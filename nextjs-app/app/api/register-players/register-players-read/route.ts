import { NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { getUnauthorizedError } from "../../common/functions";
import { getRegisterPlayers } from "../../../services/registerPlayersService/readPlayers";

export async function GET() {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }
  return NextResponse.json(await getRegisterPlayers());
}
