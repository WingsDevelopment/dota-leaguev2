import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbCommitTransactions, runDbQuery, runDbRollback, runDbStartTransactions } from "../common/functions";
/* --------- */
/*   Enums   */
/* --------- */
export enum VoteType {
    LIKE = "like",
    DISLIKE = "dislike",
    UNLIKE = "liked",
    UNDISLIKE = "disliked"
}
/* --------- */
/*   Types   */
/* --------- */
export interface PlayerVote {
    userSteamId: string |null;
    otherPlayerSteamId: string;
    type: VoteType;
}
export interface LikesAndDislikesUser {
    likes_dislikes: number
}
/**
 * Sets 0 or 1 for the person that user liked or disliked.
 *
 * @async
 * @function putLikesAndDislikes
 * @param {PlayerVote} params - The object containing params for like/dislike.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await putLikesAndDislikes({ userSteamId:"1234", otherPlayerSteamId:"4321", type:"like" });
 */
export async function putLikesAndDislikes({ userSteamId, otherPlayerSteamId, type }
    : PlayerVote): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!userSteamId || !otherPlayerSteamId || !type) {
            throw new Error("Invalid paramters (userSteamId/otherPlayerSteamId,type).");
        }
        /* -------------------- */
        /*   Begin transaction  */
        /* -------------------- */
        await runDbStartTransactions(db)
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const existingVote: LikesAndDislikesUser[] = await runDbAll(db, `SELECT likes_dislikes FROM likeDislike WHERE steam_id = ? AND other_player_steam_id = ?`, [
            String(userSteamId), String(otherPlayerSteamId)
        ]);

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
                /* ------------- */
                /*   DB Query    */
                /* ------------- */
                await runDbQuery(db, `UPDATE likeDislike SET likes_dislikes = NULL WHERE steam_id = ? AND other_player_steam_id = ?`, [
                    String(userSteamId), String(otherPlayerSteamId)
                ]);
            } else {
                const likeDislikeValue = type === VoteType.LIKE ? 1 : 0;
                /* ------------- */
                /*   DB Query    */
                /* ------------- */
                await runDbQuery(db, `UPDATE likeDislike SET likes_dislikes = ? WHERE steam_id = ? AND other_player_steam_id = ?`, [
                    likeDislikeValue, String(userSteamId), String(otherPlayerSteamId)
                ]);
            }
        } else {

            if (type === VoteType.UNLIKE || type === VoteType.UNDISLIKE) {
                throw new Error("Invalid action: No existing vote to remove.");
            }

            const likeDislikeValue = type === VoteType.LIKE ? 1 : 0;
            /* ------------- */
            /*   DB Query    */
            /* ------------- */
            await runDbQuery(db, `INSERT INTO likeDislike (steam_id, other_player_steam_id, likes_dislikes) VALUES (?, ?, ?)`, [
                String(userSteamId), String(otherPlayerSteamId), likeDislikeValue
            ]);
        }
        /* ----------------------- */
        /*   Commit Transaction    */
        /* ----------------------- */
        await runDbCommitTransactions(db)
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Vote processed successfully.",
        });
    } catch (error: any) {
        /* -------------- */
        /*   Run Rollback */
        /* ---------------*/
        await runDbRollback(db)
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error liking or disliking the user.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
