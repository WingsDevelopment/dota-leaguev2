import { closeDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { checked, discord_id } = await req.json()
    if (!discord_id) {
        return NextResponse.json(
            { error: "Missing registrationId or requestType" },
            { status: 400 }
        );
    }

    const db = await getDbInstance();

    try {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `UPDATE Players SET is_public_profile = ? WHERE discord_id = ?`,
                [checked, discord_id],
                (err) => (err ? reject(err) : resolve())
            );
        });

        closeDatabase(db)
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database update error:", error);
        closeDatabase(db)
        return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
        );
    }
}