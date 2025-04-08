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
export interface Player {
    id: number;
    discord_id: number;
    steam_id: number;
    name: string;
    mmr: number;
    captain: number;
    banned_until: string;
    games_didnt_show: number;
    games_left: number;
    games_griefed: number;
    bbb: number;
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
export async function getPlayerBySteamId<Promise>({ steamId }: getPlayerBySteamId) {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!steamId) {
            throw new Error("Missing required field: steam_id")
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const players = await runDbAll<Player[]>(db, `SELECT * FROM Players WHERE steam_id = ?`, [steamId]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        if(players.length >1){
            console.log("There is more than two players")
        }
        return getSuccessfulServiceResponse({
            message: "Fetched player by steam id successfully.",
            data: players[0]
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
