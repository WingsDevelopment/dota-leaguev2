import { isUserAdmin } from "@/app/common/constraints";
import { getGamesWithPlayers } from "@/app/services/gameService/getGamesWithPlayers";
import { getUnauthorizedError } from "../../common/functions";
import { NextResponse } from "next/server";

export async function GET() {
    // Only admins may view the games.
    if (!(await isUserAdmin())) {
        return getUnauthorizedError();
    }

    const res = await getGamesWithPlayers();
    return NextResponse.json(res);

}