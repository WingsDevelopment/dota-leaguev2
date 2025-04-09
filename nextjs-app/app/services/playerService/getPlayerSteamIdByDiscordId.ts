import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import {
    getPrimitiveServiceErrorResponse,
    getSuccessfulServiceResponse,
    runDbAll,
} from "../common/functions";
import { PrimitiveServiceResponse, ServiceResponse } from "../common/types";
/* --------- */
/*   Types   */
/* --------- */
export interface getPlayerByDiscordId {
    discordId: string | undefined |null;
}

/**
 * Gets the player by steam ID.
 *
 * @async
 * @function getPlayerByDiscordId
 * @param {getPlayerBySteamId} params - The object containing the discord ID identifier.
 * @returns {Promise<ServiceResponse<Player | undefined>>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await getPlayerSteamIdByDiscordId({ discordId: 12345 });
 */
export async function getPlayerSteamIdByDiscordId({ discordId }: getPlayerByDiscordId): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!discordId) {
            throw new Error("Missing required field: discordID");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const steamId = await runDbAll(
            db,
            `SELECT steam_id FROM Players WHERE discord_id = ?`,
            [discordId]
        );

        return getSuccessfulServiceResponse({
            message: "Fetched player steam Id by discord Id successfully.",
            data: steamId,
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error finding player by discord ID.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db);
    }
}