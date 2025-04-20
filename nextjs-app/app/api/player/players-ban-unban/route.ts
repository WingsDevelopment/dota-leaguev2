import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/app/common/constraints";
import { banUnbanPlayer } from "@/app/services/playerService/banUnbanPlayer";

export async function POST(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, value } = await req.json();

  if (!id || !value) {
    return NextResponse.json(
      { error: "Missing player ID or ban value" },
      { status: 400 }
    );
  }

  const action = value === "unban" ? "unban" : "ban";
  const response = await banUnbanPlayer({
    steam_id: id,
    action,
    banType: value,
  });

  return NextResponse.json(response);
}
