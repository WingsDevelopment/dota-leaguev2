import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

export async function PUT(req: NextRequest) {
    await isUserAdmin();

    const { steam_id, mmr } = await req.json();
    const discord_id= 12345678
    const name= "Test Name"
    if (!steam_id || !mmr) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDbInstance();
    try {
        // 1️⃣ Check if steam_id exists in Players table
        const playerExists = await new Promise((resolve, reject) => {
            db.get(
                "SELECT id FROM Players WHERE steam_id = ?",
                [steam_id],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });

        if (playerExists) {
            db.close();
            return NextResponse.json({ message: "Player already exists in Players table, no action needed." });
        }

        // 2️⃣ Insert new player into RegisterPlayers table
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO RegisterPlayers (status, steam_id, discord_id, name, mmr) VALUES (?, ?, ?, ?, ?)`,
                ["PENDING", steam_id, discord_id, name, mmr],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });

        db.close();
        return NextResponse.json({ message: "Player added to RegisterPlayers with status PENDING." });
    } catch (error) {
        db.close();
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


