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
 * @function ApprovePlayers
 * @param {RegisterPlayers} params - The object containing the identifiers for approving or disapproving player.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example 
 * const response = await ApprovePlayers({ registrationId: 1 , requestType "approve" });
 */
export async function ApprovePlayers({ registrationId, requestType }: RegisterPlayers): Promise<PrimitiveServiceResponse> {
    /* ------------------ */
    /*   Initialization   */
    /* ------------------ */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!isUserAdmin()) {
            throw new Error("User is not authorized for this action.");
        }

        if (!registrationId || !requestType) {
            throw new Error("Missing registrationId or requestType.");
        }

        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        if (requestType === "decline") {
            await runDbQuery(db, "UPDATE RegisterPlayers SET status = 'DECLINED' WHERE id = ?", [
                registrationId
            ]);
            /* ---------------- */
            /*   Return Data    */
            /* ---------------- */
            return getSuccessfulServiceResponse({
                message: "Player declined.",
            });
        }

        if (requestType === "approve") {
            /* ----------------------- */
            /*   Begins Transaction    */
            /* ----------------------- */
            await new Promise((resolve, reject) => {
                db.run("BEGIN TRANSACTION", (err) => {
                    if (err) return reject(err);
                    resolve(null);
                });
            });
            /* ------------- */
            /*   DB Query    */
            /* ------------- */
            const registration: any = await runDbAll(db, "SELECT * FROM RegisterPlayers WHERE id = ? AND status = 'PENDING'", [
                registrationId
            ]);

            if (!registration[0]) {
                /* ------------------------------- */
                /*   Rollback if already processed */
                /* ------------------------------- */
                await new Promise((resolve, reject) => db.run("ROLLBACK", () => resolve(null)));
                throw new Error("Registration not found or already processed");
            }

            /* ------------- */
            /*   DB Query    */
            /* ------------- */
            const playerExists: any = await runDbAll(db, "SELECT id FROM Players WHERE steam_id = ?", [
                registration[0].steam_id
            ]);

            if (playerExists && playerExists.length > 0) {
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
                    message: "Player already exists and registration approved.",
                });
            }
            /* ------------- */
            /*   DB Query    */
            /* ------------- */
            await runDbQuery(db, "INSERT INTO Players (discord_id, steam_id, name, mmr, vouched_date) VALUES (?, ?, ?, 1000, ?)", [
                registration[0].discord_id, registration[0].steam_id, registration[0].name, new Date().toISOString()
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
        }

        throw new Error("Invalid request Type");
    } catch (error) {
        /* --------------------- */
        /*   Rollback if failed  */
        /* --------------------- */
        await new Promise((resolve, reject) => db.run("ROLLBACK", () => resolve(null)));
        /* -------- */
        /*   Error  */
        /* -------- */
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
