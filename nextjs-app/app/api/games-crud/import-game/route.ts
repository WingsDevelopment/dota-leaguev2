// app/api/game/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createGameWithPlayers } from "../../../services/gameService/createGameWithPlayers";
import { isUserAdmin } from "../../../common/constraints";

/**
 * POST /api/game
 * Expects a JSON body with optional "direTeam" and "radiantTeam" arrays of discord IDs, and a "status" string.
 */
export async function POST(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { direTeam, radiantTeam, status } = await req.json();

  try {
    const gameId = await createGameWithPlayers(
      direTeam ?? null,
      radiantTeam ?? null,
      status ?? "PREGAME"
    );
    return NextResponse.json({ gameId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// example json:
// {
//     "direTeam": [
//       "discord_id_dire_1",
//       "discord_id_dire_2",
//       "discord_id_dire_3",
//       "discord_id_dire_4",
//       "discord_id_dire_5"
//     ],
//     "radiantTeam": [
//       "discord_id_radiant_1",
//       "discord_id_radiant_2",
//       "discord_id_radiant_3",
//       "discord_id_radiant_4",
//       "discord_id_radiant_5"
//     ],
//     "status": "OVER"
//   }
