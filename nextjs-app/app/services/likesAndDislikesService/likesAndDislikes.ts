import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

enum VoteType {
    LIKE = "like",
    DISLIKE = "dislike",
    LIKED = "liked",
    DISLIKED = "disliked"
}

interface PlayerVote {
    userSteamId: string;
    otherPlayerSteamId: string;
    type: VoteType;
}

export async function putLikesAndDislikes({ userSteamId, otherPlayerSteamId, type }: PlayerVote) {
    const db = await getDbInstance();
    try {

        await new Promise((resolve, reject) => db.run("BEGIN TRANSACTION", (err) => (err ? reject(err) : resolve(true))));

        const existingVote: Array<Record<string, any>> = await new Promise((resolve, reject) => {
            db.all(
                `SELECT likes_dislikes FROM likeDislike WHERE steam_id = ? AND other_player_steam_id = ?`,
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

        if (type === VoteType.LIKED || type === VoteType.DISLIKED) {
                await new Promise((resolve, reject) => {
                    db.run(
                        `UPDATE likeDislike SET likes_dislikes = NULL WHERE steam_id = ? AND other_player_steam_id = ?`,
                        [String(userSteamId), String(otherPlayerSteamId)],
                        function (err) {
                            if (err) {
                                console.error("Error updating database:", err);
                                return reject(err);
                            }
                            resolve(true);
                        }
                    );
                });
        } else {
            const likeDislikeValue = type === VoteType.LIKE ? 1 : 0;
            if (existingVote.length > 0) {
                    await new Promise((resolve, reject) => {
                        db.run(
                            `UPDATE likeDislike SET likes_dislikes = ? WHERE steam_id = ? AND other_player_steam_id = ?`,
                            [likeDislikeValue, String(userSteamId), String(otherPlayerSteamId)],
                            function (err) {
                                if (err) {
                                    console.error("Error updating database:", err);
                                    return reject(err);
                                }
                                resolve(true);
                            }
                        );
                    });
            } else {
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
            }
        }

        await new Promise((resolve, reject) => db.run("COMMIT", (err) => (err ? reject(err) : resolve(true))));
        closeDatabase(db);
        return { success: true, message: "Vote processed successfully." };
    } catch (error) {
        await new Promise((resolve) => db.run("ROLLBACK", () => resolve(true)));
        console.error("Error processing vote:", error);
        closeDatabase(db);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
