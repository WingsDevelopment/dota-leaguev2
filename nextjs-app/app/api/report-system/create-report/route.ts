import { NextRequest, NextResponse } from "next/server";
import { createUserReport } from "@/app/services/userReport/createUserReport";

export async function PUT(req: NextRequest) {

    const { user_steam_id, other_player_steam_id, type, report, match_id } = await req.json();

    if (!user_steam_id || !other_player_steam_id || !type || !report) {
        return NextResponse.json(
            { error: "Missing required fields." },
            { status: 400 }
        );
    }

    if (type !== "GRIEF" && type !== "BAD BEHAVIOUR") {
        return NextResponse.json(
            { error: "Faulty report type." },
            { status: 400 }
        );
    }
    if (report.length > 256) {
        return NextResponse.json(
            { error: "Report text exceeds 256 characters." },
            { status: 400 }
        );
    }
    if (match_id !== undefined && match_id !== null && (isNaN(match_id) || typeof match_id !== "number")) {
        return NextResponse.json(
            { error: "Match ID must be a valid number." },
            { status: 400 }
        );
    }
    const res = await createUserReport({ user_steam_id, other_player_steam_id, type, report, match_id });
    return NextResponse.json(res);

}
