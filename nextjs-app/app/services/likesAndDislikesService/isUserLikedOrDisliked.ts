import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll } from "../common/functions";
import { ServiceResponse } from "../common/types";

export interface isUserLikerOrDisliked {
    userSteamId: string |null;
    otherPlayerSteamId: string;
}
export interface LikedOrDisliked {
    likes_dislikes: number
}
/**
 * Returns 0 or 1 representing the value if user liked or disliked the other user that is being watched.
 *
 * @async
 * @function isUserLikedOrDisliked
 * @param {getPlayerBySteamId} params - The object containing the steam id.
 * @returns {Promise<ServiceResponse<LikedOrDisliked>>} A promise that resolves to a service response which returns 
 * 0 or 1 representing the value if user liked or disliked the other user that is being watched.
 *
 * @example
 * const response = await isUserLikedOrDislikedByOtherUser({ userSteamId:"1234", otherPlayerSteamId:"4321" });
 */
export async function isUserLikedOrDislikedByOtherUser({ userSteamId, otherPlayerSteamId }:
    isUserLikerOrDisliked): Promise<ServiceResponse<LikedOrDisliked>> {
    /* ----------------- */
    /*   Initialization  */
    /* ----------------- */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!otherPlayerSteamId || !userSteamId) {
            throw new Error("Missing users or other user steam_id.");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const lod = await runDbAll<LikedOrDisliked[]>(db, `SELECT likes_dislikes FROM likeDislike WHERE steam_id = ? AND other_player_steam_id = ?`, [
            userSteamId, otherPlayerSteamId
        ]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Fetched info if user like or disliked the user he is watching.",
            data: lod[0]
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error getting info if user liked or disliked user he is watching.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}