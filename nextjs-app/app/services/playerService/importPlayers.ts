import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import {
    getPrimitiveServiceErrorResponse,
    getSuccessfulServiceResponse,
    runDbQuery,
} from "../common/functions";

/* --------- */
/*   Types   */
/* --------- */
export interface Leaderboard {
    leaderboard: {
        discord_id: string,
        name: string,
        mmr: number,
        steam_id: string,
        captain: number,
    },
}

/**
 * Imports player from object leaderboards.
 *
 * @async
 * @function ImportPlayers
 * @param {Leaderboard} params - The object containing the leaderboard indentifiers.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await ImportPlayers({ leaderboard });
 */
export async function ImportPlayers({
    leaderboard
}: Leaderboard): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!Array.isArray(leaderboard)) {
            throw new Error("Missing or invalid leaderboard array.");
        }
        /* --------------- */
        /*   Loop start    */
        /* --------------- */
        for (const player of leaderboard) {
            // Convert to string so that large numbers aren’t truncated by JS
            const discordIdStr = String(player.discord_id);
            const steamIdStr = String(player.steam_id);

            // MMR can remain an integer if you prefer
            const mmrValue = player.mmr ? Number(player.mmr) : 1000;
            /* ------------- */
            /*   DB Query    */
            /* ------------- */
            await runDbQuery(db, `INSERT INTO Players (discord_id, steam_id, name, mmr)
           VALUES (?, ?, ?, ?)`, [
                discordIdStr, steamIdStr, player.name, mmrValue
            ]);
        }
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Imported leaderboard successfully.",
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
