import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { ServiceResponse } from "../common/types";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll } from "../common/functions";
import { isUserAdmin } from "@/app/common/constraints";
import { vouch } from "@/components/admin/register-crud";

/**
 * Approves players who registered.
 *
 * @async
 * @function ReadPlayers
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example 
 * const response = await DeletePlayers({ steam_id: "123123" });
 */
export async function ReadPlayers(): Promise<ServiceResponse<vouch[]>> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!(await isUserAdmin())) {
            throw new Error("Access Denied.")
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const registerPlayers: any = await runDbAll(db, `SELECT * FROM RegisterPlayers`, [
        ]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            data: registerPlayers
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(
            error,
            "Error getting data from Register Table."
        );
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db);
    }
}
