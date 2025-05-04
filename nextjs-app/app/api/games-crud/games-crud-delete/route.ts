import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { deleteGame } from "@/app/services/gameService/deleteGame";
import { getUnauthorizedError } from "../../common/functions";

export async function DELETE(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }

  const { id, status, result } = await req.json();
  const res = await deleteGame({ id, status, result });
  return NextResponse.json(res);
}
