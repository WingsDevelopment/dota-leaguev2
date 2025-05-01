import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import { isUserAdmin } from "@/app/common/constraints";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbQuery } from "../common/functions";

/* --------- */
/*   Types   */
/* --------- */
export interface RegisterPlayers {
    registrationId: number
    requestType: string
}
/**
 * Approves players who registered.
 *
 * @async
 * @function setApprovePlayers
 * @param {RegisterPlayers} params - The object containing the identifiers for approving or disapproving player.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example 
 * const response = await setApprovePlayers({ registrationId: 1 , requestType "approve" });
 */
export async function setDeclinePlayers({ registrationId, requestType }: RegisterPlayers): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */

        if (!registrationId || requestType !== "decline") {
            throw new Error("Missing registrationId or invalid requestType.");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        await runDbQuery(db, "UPDATE RegisterPlayers SET status = 'DECLINED' WHERE id = ?", [
            registrationId
        ]);
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Player declined.",
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(
            error,
            "Error declining players."
        );
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db);
    }
}
