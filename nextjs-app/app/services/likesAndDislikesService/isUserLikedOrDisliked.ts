import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll } from "../common/functions";
import { ServiceResponse } from "../common/types";

export interface isUserLikerOrDisliked {
    userSteamId: string;
    otherPlayerSteamId: string;
}
export interface LikedOrDisliked {
    lod?: boolean
}
/**
 * Returns the sum of likes and dislikes for the user by steam Id.
 *
 * @async
 * @function getPlayerLikesAndDislikes
 * @param {getPlayerBySteamId} params - The object containing the steam id.
 * @returns {Promise<ServiceResponse>} A promise that resolves to a service response which return Likes and Dislikes or undefined.
 *
 * @example
 * const response = await getMatchHistory({ steamId: "123" });
 */
export async function isUserLikedOrDisliked({ userSteamId, otherPlayerSteamId }:
    isUserLikerOrDisliked): Promise<ServiceResponse<LikedOrDisliked | undefined>> {
    /* ----------------- */
    /*   Initialization  */
    /* ----------------- */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        console.log(userSteamId, otherPlayerSteamId, "correct Info")
        if (!otherPlayerSteamId || !userSteamId) {
            throw new Error("Missing users or other user steam_id.");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const lod = await runDbAll<LikedOrDisliked>(db, `SELECT likes_dislikes FROM likeDislike WHERE steam_id = ? AND other_player_steam_id = ?`, [
            userSteamId, otherPlayerSteamId
        ]);
        console.log(lod,"LOD")
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Fetched info if user like or disliked the user he is watching.",
            data: lod
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