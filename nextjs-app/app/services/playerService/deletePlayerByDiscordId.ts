import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import {
    getPrimitiveServiceErrorResponse,
    getSuccessfulServiceResponse,
    runDbAll,
    runDbQuery,
} from "../common/functions";
import { PrimitiveServiceResponse } from "../common/types";
import { getPlayerBySteamId } from "./getPlayerBySteamId";
import { getPlayerByDiscordId } from "./getPlayerSteamIdByDiscordId";

/**
 * Deletes player by discord Id.
 *
 * @async
 * @function deletePlayerByDiscordId
 * @param {getPlayerByDiscordId} params - The object containing the discordId identifier.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await deletePlayerByDiscordId({ discordId: 12345 });
 */
export async function deletePlayerByDiscordId({ discordId }: getPlayerByDiscordId): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!discordId) {
            throw new Error("Missing required field: discord_id");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const changes: any = await runDbQuery(
            db,
            `DELETE FROM Players WHERE discord_id = ?`,
            [discordId]
        );
        if (changes.changes === 0) {
            throw new Error("Player not found.");
        }
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Deleted player by discord id successfully."
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error deleting player by discord ID.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db);
    }
}