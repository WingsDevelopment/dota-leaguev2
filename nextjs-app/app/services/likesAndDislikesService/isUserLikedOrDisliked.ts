import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

interface isUserLikerOrDisliked {
    userSteamId: string;
    otherPlayerSteamId: string;
}

export async function isUserLikedOrDisliked({ userSteamId, otherPlayerSteamId }: isUserLikerOrDisliked) {
    const db = await getDbInstance();
    
    try {
        const lod: Array<Record<string, any>> = await new Promise((resolve, reject) => {
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
        closeDatabase(db);
        return { success: true,  data: lod.length > 0 ? lod : [{ likes_dislikes: null }] };
    } catch (error) {

    }
}