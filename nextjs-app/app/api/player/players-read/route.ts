import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { GetPlayers } from "@/app/services/playerService/getPlayers";
import { getUnauthorizedError } from "../../common/functions";

export async function GET() {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError()
  }
  return NextResponse.json(await GetPlayers());
}

