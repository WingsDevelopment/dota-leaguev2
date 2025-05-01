import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll } from "../common/functions";
import { ServiceResponse } from "../common/types";
/* --------- */
/*   Types   */
/* --------- */
export interface getPlayerBySteamId {
    steamId: string;
}
export interface SumOfLikesAndDislikes {
    likes: number,
    dislikes: number
}
/* --------- */
/*   Enums   */
/* --------- */
enum LikeType {
    LIKE = 1,
    DISLIKE = 0
}
/**
 * Returns the sum of likes and dislikes for the user by steam Id.
 *
 * @async
 * @function getPlayerLikesAndDislikes
 * @param {getPlayerBySteamId} params - The object containing the steam id.
 * @returns {Promise<ServiceResponse<SumOfLikesAndDislikes | undefined>>} A promise that resolves to a service response which return Likes and Dislikes or undefined.
 *
 * @example
 * const response = await getMatchHistory({ steamId: "123" });
 */
export async function getPlayerLikesAndDislikes({
    steamId
}: getPlayerBySteamId): Promise<ServiceResponse<SumOfLikesAndDislikes | undefined>> {
    /* ----------------- */
    /*   Initialization  */
    /* ----------------- */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!steamId) {
            throw new Error("Missing steam_id parameter");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const likeDislikeRows = await runDbAll<SumOfLikesAndDislikes[]>(db, `SELECT likes_dislikes FROM likeDislike WHERE other_player_steam_id = ?`, [
            steamId
        ]);

        let likes = 0;
        let dislikes = 0;

        likeDislikeRows.forEach((row: any) => {
            if (row.likes_dislikes === LikeType.LIKE) {
                likes++;
            } else if (row.likes_dislikes === LikeType.DISLIKE) {
                dislikes++;
            }
        });

        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Fetched likes and dislikes successfully.",
            data: { likes, dislikes }
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error processing likes/dislikes.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
