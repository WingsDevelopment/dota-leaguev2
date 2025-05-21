import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { cancelPregameOrHostedGame } from "@/app/services/gameService/cancelPregameOrHostedGame";
import { getUnauthorizedError } from "../../common/functions";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }
  const { id, status } = await req.json();
  const res = await cancelPregameOrHostedGame({ id, status });
  return NextResponse.json(res);
}
