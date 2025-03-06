// app/api/games-crud/games-crud-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { deleteGame } from "@/app/services/gameService/deleteGame";

export async function DELETE(req: NextRequest) {
  // Only admins may delete games.
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, result } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "There is no game id" }, { status: 400 });
  }

  try {
    const res = await deleteGame({ id, status, result });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in DELETE route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
