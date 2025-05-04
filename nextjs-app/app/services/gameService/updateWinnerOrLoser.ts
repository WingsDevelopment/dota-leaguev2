import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";
import { calculateElo } from "../../../lib/utils";
import { PrimitiveServiceResponse } from "../common/types";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbCommitTransactions, runDbQuery, runDbRollback, runDbStartTransactions } from "../common/functions";
/* --------- */
/*   Types   */
/* --------- */
export interface UpdateWinnerLoser {
    id: number;
    status: string;
    team_won: number;
}
export interface WinnerOrLoserPlayers{
    player_id: number; 
    team: number; 
    mmr: number
}
/**
 * Deletes the game and refunds mmr based on status.
 *
 * @async
 * @function getPlayerLikesAndDislikes
 * @param {getPlayerBySteamId} params - The object containing the steam id.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a service response which return Likes and Dislikes or undefined.
 *
 * @example
 * const response = await deleteGame({ id: 1, status:"OVER", result:0 });
 */
export async function UpdateWinnerOrLoser({ id, status, team_won }: UpdateWinnerLoser): Promise<PrimitiveServiceResponse> {

    const db = await getDbInstance();
    try {
        if (!id || team_won === undefined || !status) {
            throw new Error("Missing game id, team_won, or status.");

        }

        // Fetch the actual status from the database.
        const actualGame = await runDbAll(
            db,
            `SELECT status FROM Game WHERE id = ?`,
            [id]
        );

        if (!actualGame) {
            throw new Error("Game not found.");

        }

        // Start a transaction.
        await runDbStartTransactions(db);

        // Get all players (including their current mmr) for the game.
        const players = await runDbAll<WinnerOrLoserPlayers[]>(
            db,
            `SELECT gp.player_id, gp.team, p.mmr 
           FROM gamePlayers gp 
           JOIN Players p ON gp.player_id = p.id 
           WHERE gp.game_id = ?`,
            [id]
        );
        console.log(players,"CALLERRR")
        if (players.length === 0) {
            // Rollback if no players found.
            await runDbRollback(db);
            throw new Error("No players found for this game.");
        }

        // Split players into two teams.
        const radiantPlayers = players.filter((p) => p.team === 0);
        const direPlayers = players.filter((p) => p.team === 1);
        console.log(radiantPlayers,"RADIANT TEAM")
        console.log(direPlayers,"DIRE TEAM")
        if (radiantPlayers.length === 0 || direPlayers.length === 0) {
            await runDbRollback(db);
            throw new Error("Insufficient players to calculate Elo.");
        }

        // Calculate the average MMR for each team.
        const radiantAvg =
            radiantPlayers.reduce((sum, p) => sum + p.mmr, 0) / radiantPlayers.length;
        const direAvg =
            direPlayers.reduce((sum, p) => sum + p.mmr, 0) / direPlayers.length;

        // Compute the ELO change.
        // team_won is assumed to be 0 (radiant wins) or 1 (dire wins).
        const eloChange = calculateElo(
            radiantAvg,
            direAvg,
            team_won === 0 ? 1 : -1
        );

        // Update MMR, wins, and loses for each player based on the match result.

            players.map(({ player_id, team }) => {
                return new Promise(() => {
                    if (team === team_won) {
                        // For the winning team, increase mmr, wins, and streak.
                        runDbQuery(
                            db,
                            `UPDATE Players SET mmr = mmr + ?, wins = wins + 1, streak = streak + 1 WHERE id = ?`,
                            [eloChange, player_id]
                        );
                    } else {
                        // For the losing team, decrease mmr, increase loses and reset streak.
                        runDbQuery(
                            db,
                            `UPDATE Players SET mmr = mmr - ?, loses = loses + 1, streak = 0 WHERE id = ?`,
                            [eloChange, player_id]
                        );
                    }
                });
            })


        // Update Game table status to "OVER" with the match result.
        await runDbQuery(
            db,
            `UPDATE Game SET result = ?, status = 'OVER', steam_match_id = ? WHERE id = ?`,
            [team_won, -1, id]
        );
        // Commit the transaction.
        await runDbCommitTransactions(db)
        /* ---------------- */
        /*   Return Data    */
        /* ---------------- */
        return getSuccessfulServiceResponse({
            message: "Deleted game successfully."
        });
    } catch (error) {
        /* ----------- */
        /*   Rollback  */
        /* ----------- */
        await runDbRollback(db)
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
