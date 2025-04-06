import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import { isUserAdmin } from "@/app/common/constraints";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbCommitTransactions, runDbQuery, runDbRollback, runDbStartTransactions } from "../common/functions";

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
export async function setApprovePlayers({ registrationId, requestType }: RegisterPlayers): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!registrationId || requestType !== "approve") {
            throw new Error("Missing registrationId or invalid requestType.");
        }
        /* -------------------- */
        /*   Begin transaction  */
        /* -------------------- */
        await runDbStartTransactions(db)
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const registrations: any = await runDbAll(db, "SELECT * FROM RegisterPlayers WHERE id = ? AND status = 'PENDING'", [
            registrationId
        ]);
        const registration = registrations[0];
        if (!registration) {
            /* ------------- */
            /*   Rollback    */
            /* ------------- */
            await runDbRollback(db);
            /* ---------- */
            /*   Error    */
            /* ---------- */
            throw new Error("Registration not found or already processed");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const playerExists: any = await runDbAll(db, "SELECT id FROM Players WHERE steam_id = ?", [
            registration.steam_id
        ]);

        if (playerExists && playerExists.length > 0) {
            /* ------------- */
            /*   DB Query    */
            /* ------------- */
            await runDbQuery(db, "UPDATE RegisterPlayers SET status = 'APPROVED' WHERE id = ?", [
                registrationId
            ]);
            /* ----------------------- */
            /*   Commit Transaction    */
            /* ----------------------- */
            await runDbCommitTransactions(db);
            /* ---------------- */
            /*   Return Data    */
            /* ---------------- */
            return getSuccessfulServiceResponse({
                message: "Player already exists and registration approved.",
            });
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        await runDbQuery(db, "INSERT INTO Players (discord_id, steam_id, name, mmr, vouched_date) VALUES (?, ?, ?, 1000, ?)", [
            registration.discord_id, registration.steam_id, registration.name, new Date().toISOString()
        ]);
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        await runDbQuery(db, "UPDATE RegisterPlayers SET status = 'APPROVED' WHERE id = ?", [
            registrationId
        ]);

        await new Promise((resolve, reject) => db.run("COMMIT", () => resolve(null)));
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Player successfully approved.",
        });
    } catch (error) {
        /* ------------- */
        /*   Rollback    */
        /* ------------- */
        await runDbRollback(db)
        /* ---------- */
        /*   Error    */
        /* ---------- */
        return getPrimitiveServiceErrorResponse(
            error,
            "Error approving players."
        );
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db);
    }
}
