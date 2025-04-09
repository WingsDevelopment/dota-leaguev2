import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import {
    getPrimitiveServiceErrorResponse,
    getSuccessfulServiceResponse,
    runDbAll,
    runDbQuery,
} from "../common/functions";
import { PrimitiveServiceResponse, ServiceResponse } from "../common/types";
import { getPlayerBySteamId } from "./getPlayerBySteamId";

/**
 * Deletes player by steam Id.
 *
 * @async
 * @function deletePlayerBySteamId
 * @param {getPlayerBySteamId} params - The object containing the steam Id identifier.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await deletePlayerBySteamId({ steamId: 12345 });
 */
export async function deletePlayerBySteamId({ steamId }: getPlayerBySteamId): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!steamId) {
            throw new Error("Missing required field: steam_id");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const changes: any = await runDbQuery(
            db,
            `DELETE FROM Players WHERE steam_id = ?`,
            [steamId]
        );
        if (changes.changes === 0) {
            throw new Error("Player not found.");
        }
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Deleted player by steam id successfully."

        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error deleting player by steam id.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db);
    }
}