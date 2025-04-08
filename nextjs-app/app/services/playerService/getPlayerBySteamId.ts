import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll } from "../common/functions";
/* --------- */
/*   Types   */
/* --------- */
export interface getPlayerBySteamId {
    steamId: string | null;
}
/**
 * Gets the player by steam ID.
 *
 * @async
 * @function getPlayerBySteamId
 * @param {getPlayerBySteamId} params - The object containing the steam ID identifier.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await getPlayerBySteamId({ steamId: 12345 });
 */
export async function getPlayerBySteamId({ steamId }: getPlayerBySteamId) {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!steamId) {
            return NextResponse.json({ error: "Missing steam ID" }, { status: 400 });
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const player = await runDbAll(db, `SELECT * FROM Players WHERE steam_id = ?`, [steamId]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Fetched player by steam id successfully.",
            data: player
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error finding player.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
