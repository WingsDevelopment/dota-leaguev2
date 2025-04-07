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
export interface PublicProfile {
    checked: number,
    discord_id: string,
}

/**
 * Changes public view of the user profile.
 *
 * @async
 * @function UpdateIsPlayerProfilePublic
 * @param {PublicProfile} params - The object containing the user and profile view indentifiers.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await UpdateIsPlayerProfilePublic({ checked:1, discord_id:123 });
 */
export async function UpdateIsPlayerProfilePublic({
    checked, discord_id
}: PublicProfile): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();

    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!discord_id) {
            throw new Error("Missing discord id.");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        await runDbQuery(db, `UPDATE Players SET is_public_profile = ? WHERE discord_id = ?`, [
            checked, discord_id
        ]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Profile visiblity successfully changed.",
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error changing profile visibility.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db)
    }
}
