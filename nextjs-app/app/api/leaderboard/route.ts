import { NextResponse } from "next/server";
import { getLeaderboard } from "@/app/services/leaderboardService/getLeaderboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await getLeaderboard();
  return NextResponse.json(res);
}
