import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import { getSuccessfulServiceResponse, runDbAll, runDbQuery } from "../common/functions";

/* --------- */
/*   Types   */
/* --------- */
export interface DeletePlayer {
    steam_id?: string | null;
}
/**
 * Approves players who registered.
 *
 * @async
 * @function DeletePlayers
 * @param {DeletePlayer} params - The object containing the identifier for deleting user from table.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example 
 * const response = await DeletePlayers({ steam_id: "123123" });
 */
export async function DeletePlayers({ steam_id }: DeletePlayer): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    let totalChanges = 0
    console.log(steam_id, "STEAM ID")
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!steam_id) {
            throw new Error("Missing required field: steam_id")
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const changes: any = await runDbQuery(db, `DELETE FROM RegisterPlayers WHERE steam_id = ?`, [
            steam_id
        ]);
        totalChanges += changes.changes
        if (totalChanges > 0) {
            /* ---------------- */
            /*   Return Data    */
            /* ---------------- */
            return getSuccessfulServiceResponse({
                message: "Player record deleted successfully.",
            });
        } else {
            /* ---------------- */
            /*   Return Data    */
            /* ---------------- */
            return getSuccessfulServiceResponse({
                message: "Player record not found.",
            });
        }
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        throw new Error("Failed deleting the player.")
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
