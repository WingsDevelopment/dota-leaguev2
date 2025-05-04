import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { getUnauthorizedError } from "../../common/functions";
import { UpdateWinnerOrLoser } from "@/app/services/gameService/updateWinnerOrLoser";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }

  const { id, team_won, status } = await req.json();
  const res = await UpdateWinnerOrLoser({ id, status, team_won });
  return NextResponse.json(res);
}
