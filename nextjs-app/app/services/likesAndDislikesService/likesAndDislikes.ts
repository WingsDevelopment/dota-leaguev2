import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

interface getPlayerBySteamId {
    userSteamId: string;
    otherPlayerSteamId: string;
    type: string
}

export async function getLikesAndDislikes({ userSteamId, otherPlayerSteamId, type }: getPlayerBySteamId) {
    const db = await getDbInstance();
    try {
        const existingVote: Array<Record<string, any>> = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM likeDislike WHERE steam_id = ? AND other_player_steam_id = ?`,
                [String(userSteamId), String(otherPlayerSteamId)],
                (err, rows) => {
                    if (err) {
                        console.error("Error executing query:", err);
                        return reject(err);
                    }
                    resolve(rows as any);
                }
            );
        });
        if (existingVote.length > 0) {
            closeDatabase(db);
            return { success: false, message: "You have already voted for this person." }
        }

        const likeDislikeValue = type === "like" ? 1 : 0;
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO likeDislike (steam_id, other_player_steam_id, likes_dislikes) VALUES (?, ?, ?)`,
                [String(userSteamId), String(otherPlayerSteamId), likeDislikeValue],
                function (err) {
                    if (err) {
                        console.error("Error inserting into database:", err);
                        return reject(err);
                    }
                    resolve(true);
                }
            );
        });

        closeDatabase(db);
        return { success: true, message: "Vote recorded successfully." };
    } catch (error) {
        console.error("Error processing vote:", error);
        closeDatabase(db);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
