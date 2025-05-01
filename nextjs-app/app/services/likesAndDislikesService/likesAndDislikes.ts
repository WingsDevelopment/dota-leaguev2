import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

enum VoteType {
    LIKE = "like",
    DISLIKE = "dislike",
    UNLIKE = "liked",
    UNDISLIKE = "disliked"
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

        if (existingVote.length > 0) {
            const currentVote = existingVote[0].likes_dislikes;

            if (type === VoteType.UNLIKE && currentVote !== 1) {
                throw new Error("Invalid action: Cannot remove a like when no like exists.");
            }
            if (type === VoteType.UNDISLIKE && currentVote !== 0) {
                throw new Error("Invalid action: Cannot remove a dislike when no dislike exists.");
            }

            if (
                (type === VoteType.LIKE && currentVote === 1) ||
                (type === VoteType.DISLIKE && currentVote === 0)
            ) {
                throw new Error("Invalid action: This player has already been liked/disliked.");
            }


            if (type === VoteType.UNLIKE || type === VoteType.UNDISLIKE) {
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
            }
        } else {

            if (type === VoteType.UNLIKE || type === VoteType.UNDISLIKE) {
                throw new Error("Invalid action: No existing vote to remove.");
            }

            const likeDislikeValue = type === VoteType.LIKE ? 1 : 0;
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

        await new Promise((resolve, reject) => db.run("COMMIT", (err) => (err ? reject(err) : resolve(true))));
        closeDatabase(db);
        return { success: true, message: "Vote processed successfully." };
    } catch (error: any) {
        await new Promise((resolve) => db.run("ROLLBACK", () => resolve(true)));
        console.error("Error processing vote:", error.message);
        closeDatabase(db);
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
