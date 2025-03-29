import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

interface userReport {
    user_steam_id: number;
    other_player_steam_id: number;
    type: string;
    report: string;
    match_id: number;
}

enum ReportType {
    GRIEF = "GRIEF",
    BAD_BEHAVIOUR = "BAD BEHAVIOUR",
}

export async function createUserReport({ user_steam_id, other_player_steam_id, type, report, match_id }: userReport) {

    const db = await getDbInstance();

    if (!(type in ReportType)) {
        return NextResponse.json(
            { error: "Invalid report type." },
            { status: 400 }
        );
    }

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
                `INSERT INTO UserReport (steam_id, other_player_steam_id, type, report, match_id) VALUES (?, ?, ?, ?, ?)`,
                [user_steam_id, other_player_steam_id, type, report, match_id],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });

        closeDatabase(db);
        return NextResponse.json({
            sucess: true, message: "Report added.",
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
