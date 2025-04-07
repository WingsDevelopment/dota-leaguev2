import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import {
    getPrimitiveServiceErrorResponse,
    getSuccessfulServiceResponse,
    runDbAll,
    runDbQuery,
} from "../common/functions";


/**
 * Gets all the players from database.
 *
 * @async
 * @function GetPlayers
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await GetPlayers();
 */
export async function GetPlayers(): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();

    try {
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const players = await runDbAll(db, `SELECT * FROM Players`, []);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Fetched all players successfully.",
            data: players
        });

    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Import erorr.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
