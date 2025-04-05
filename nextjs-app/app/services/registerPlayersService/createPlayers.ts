import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbQuery } from "../common/functions";

/* --------- */
/*   Types   */
/* --------- */
export interface PlayerDataVouch {
    steam_id: number
    mmr: number
    name: string
    discord_id: string
}
/**
 * Approves players who registered.
 *
 * @async
 * @function CreatePlayers
 * @param {PlayerDataVouch} params - The object containing the identifiers for creating player into register table.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example 
 * const response = await CreatePlayers({ steam_id: 123123 , mmr: 1000 , name: "Marko" , discord_id: 123123 });
 */
export async function CreatePlayers({ steam_id, mmr, name, discord_id }: PlayerDataVouch): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();

    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!steam_id || !mmr) {
            throw new Error("Missing steam_id or mmr.")
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        await runDbQuery(db, `CREATE TABLE IF NOT EXISTS RegisterPlayers (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             status TEXT NOT NULL,
             steam_id TEXT NOT NULL,
             discord_id TEXT NOT NULL,
             name TEXT NOT NULL,
             mmr INTEGER NOT NULL
           )`, [
        ]);
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const playerExists: any = await runDbAll(db, "SELECT id FROM Players WHERE steam_id = ?", [
            steam_id
        ]);

        if (playerExists.length > 0) {
            /* ---------------- */
            /*   Return Data    */
            /* ---------------- */
            return getSuccessfulServiceResponse({
                message: "Player already exists in Players table, no action needed.",
            });
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        await runDbQuery(db, `INSERT INTO RegisterPlayers (status, steam_id, discord_id, name, mmr) VALUES (?, ?, ?, ?, ?)`, [
            "PENDING", steam_id, discord_id, name, 1000
        ]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Player added to RegisterPlayers with status PENDING.",
        });

    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
                return getPrimitiveServiceErrorResponse(
                    error,
                    "Error creating player into register table."
                );
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
