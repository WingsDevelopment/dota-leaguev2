import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";

export async function PUT(req: NextRequest) {

    const { user_steam_id, other_player_steam_id, type, report, match_id } = await req.json();

    if (!user_steam_id || !other_player_steam_id || !type || !report) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const db = await getDbInstance();

    try {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `CREATE TABLE IF NOT EXISTS UserReport (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        steam_id INTEGER DEFAULT NULL,
        other_player_steam_id INTEGER DEFAULT NULL, 
        type TEXT NOT NULL,
        match_id INTEGER DEFAULT NULL,
        report TEXT NOT NULL CHECK (LENGTH(report) <= 256),
        reviewed BOOLEAN DEFAULT 0,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO UserReport (steam_id, other_player_steam_id, type, report) VALUES (?, ?, ?, ?)`,
                [user_steam_id, other_player_steam_id, type, report],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });

        closeDatabase(db);
        return NextResponse.json({
            message: "Report added.",
        });

    } catch (error) {
        closeDatabase(db);
        console.error("Error adding the report:", error);
        return NextResponse.json(
            { error: `Error adding the report: ${error}` },
            { status: 500 }
        );
    }
}
