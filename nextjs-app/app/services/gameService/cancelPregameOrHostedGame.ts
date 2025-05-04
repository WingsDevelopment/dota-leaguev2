import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";
import { calculateElo } from "../../../lib/utils";
import { PrimitiveServiceResponse } from "../common/types";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbCommitTransactions, runDbQuery, runDbRollback, runDbStartTransactions } from "../common/functions";
export interface CanceledGames {
    id: number;
    status: string;
}
/**
 * Cancel the game that is in PREGAME or HOSTED status.
 *
 * @async
 * @function cancelPregameOrHostedGame
 * @param {CanceledGames} params - The object containing game id and status.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a service response.
 *
 * @example
 * const response = await deleteGame({ id: 1, status:"PREGAME" });
 */
export async function cancelPregameOrHostedGame({ id, status }
    : CanceledGames): Promise<PrimitiveServiceResponse> {
    /* ----------------- */
    /*   Initialization  */
    /* ----------------- */
    const db = await getDbInstance();
    try {
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if (!id === undefined || !status) {
            throw new Error("Missing game id or status.");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        const game = await runDbAll<CanceledGames[]>(
            db,
            `SELECT status FROM Game WHERE id = ?`,
            [id]
        );
        /* ------------- */
        /*   Validation  */
        /* ------------- */
        if(game.length>1){
            console.log("There are more than 1 game with same id.")
        }
        const actualGame= game[0]
        console.log(actualGame.status, "SERVICEeuaa", status, "Status od rute")
        if (!actualGame) {
            throw new Error("Game not found.");
        }
        if (actualGame.status != status) {
            throw new Error("Game status mismatch. Possible tampering detected.");
        }
        if (actualGame.status != "PREGAME" && actualGame.status != "HOSTED") {
            throw new Error("Game already started.");
        }
        /* ------------- */
        /*   DB Query    */
        /* ------------- */
        await runDbQuery(
            db,
            `UPDATE Game SET status ='CANCEL' WHERE id= ?`,
            [id]
        );
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Game is successfully canceled."
        });
    } catch (error) {
        /* -------- */
        /*   Error  */
        /* -------- */
        return getPrimitiveServiceErrorResponse(error, "Error deleting the game.");
    } finally {
        /* -------- */
        /*  Cleanup */
        /* -------- */
        closeDatabase(db);
    }
}
