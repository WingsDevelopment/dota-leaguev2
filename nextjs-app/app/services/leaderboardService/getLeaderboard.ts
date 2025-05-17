import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll } from "../common/functions";
import { PrimitiveServiceResponse, ServiceResponse } from "../common/types";

/**
 * Returns leaderboard.
 *
 * @async
 * @function getLeaderboard
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await getLeaderboard();
 */
export async function getLeaderboard(
): Promise<PrimitiveServiceResponse> {
    /* ----------------- */
    /*   Initialization  */
    /* ----------------- */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const leaderboard = await runDbAll(db, `
            SELECT *
              FROM Players
              ORDER BY mmr DESC`, [
        ]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Fetched leaderboard successfully",
            data: leaderboard
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error fetching leaderboard.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
