import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";
import { calculateElo } from "../../../lib/utils";
import { PrimitiveServiceResponse } from "../common/types";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbCommitTransactions, runDbQuery, runDbRollback, runDbStartTransactions } from "../common/functions";
/* --------- */
/*   Types   */
/* --------- */
export interface DeleteGameParams {
  id: number;
  status: string;
  result: number | null;
}
/**
 * Deletes the game and refunds mmr based on status.
 *
 * @async
 * @function getPlayerLikesAndDislikes
 * @param {DeleteGameParams} params - The object containing params for deleting the game.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a service response.
 *
 * @example
 * const response = await deleteGame({ id: 1, status:"OVER", result:0 });
 */
export async function deleteGame({ id, status, result }: DeleteGameParams): Promise<PrimitiveServiceResponse> {
  /* ----------------- */
  /*   Initialization  */
  /* ----------------- */
  const db = await getDbInstance();
  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    if (!id) {
      throw new Error("There is no game id!!!");
    }
    console.log(
      `Starting deletion for game ${id} with status "${status}" and result ${result}`
    );

    /* ---------------------- */
    /*   Begin Transcation    */
    /* ---------------------- */
    await runDbStartTransactions(db)

    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    const gameExists: any = await runDbQuery(
      db,
      `SELECT id FROM Game WHERE id = ?`,
      [id]
    );

    if (!gameExists) {
      console.log(`Game ${id} does not exist. Rolling back.`);
      /* ------------- */
      /*   Rollback    */
      /* ------------- */
      await runDbRollback(db)
      throw new Error("Game is already deleted.");
    }

    // If the game is in "OVER" status, update player MMR values using calculateElo.
    if (status === "OVER" && result !== null) {
      console.log("Game is OVER. Recalculating Elo for players...");
      /* ------------- */
      /*   DB Query    */
      /* ------------- */
      const players = await runDbAll<[any]>(
        db,
        `SELECT gp.player_id, gp.team, p.mmr 
           FROM GamePlayers gp 
           JOIN Players p ON gp.player_id = p.id 
           WHERE gp.game_id = ?`,
        [id]
      );

      console.log("Players fetched for Elo recalculation:", players);

      // Separate players by team.
      const radiantPlayers = players.filter((p) => p.team === 0);
      const direPlayers = players.filter((p) => p.team === 1);

      // Compute average MMR for each team.
      const radiantAvg =
        radiantPlayers.length > 0
          ? radiantPlayers.reduce((sum, p) => sum + p.mmr, 0) /
          radiantPlayers.length
          : 0;
      const direAvg =
        direPlayers.length > 0
          ? direPlayers.reduce((sum, p) => sum + p.mmr, 0) / direPlayers.length
          : 0;
      console.log(
        `Radiant average MMR: ${radiantAvg}, Dire average MMR: ${direAvg}`
      );

      // Calculate Elo change.
      // Using the same logic as your PUT route: if result === 0 (Radiant wins), then parameter is 1; if result === 1 (Dire wins), parameter is -1.
      const eloChange = calculateElo(
        radiantAvg,
        direAvg,
        result === 0 ? 1 : -1
      );
      console.log(`Calculated Elo change: ${eloChange}`);

      // Update each player's MMR in reverse.
      for (const { player_id, team } of players) {
        // Revert the change: if player's team equals the winning team (result) then subtract eloChange; otherwise add eloChange.
        const adjustment = team === result ? -eloChange : eloChange;
        console.log(
          `Updating player ${player_id} (team ${team}): applying adjustment ${adjustment}`
        );
        if (team === result) {
          /* ------------- */
          /*   DB Query    */
          /* ------------- */
          await runDbQuery(
            db,
            `UPDATE Players SET mmr = mmr + ?, wins = wins - 1 WHERE id = ?`,
            [adjustment, player_id]
          );
        } else {
          /* ------------- */
          /*   DB Query    */
          /* ------------- */
          await runDbQuery(
            db,
            `UPDATE Players SET mmr = mmr + ?, loses = loses - 1 WHERE id = ?`,
            [adjustment, player_id]
          );
        }
      }
    } else {
      console.log(
        `Game ${id} is not in OVER status; no Elo changes to revert.`
      );
    }

    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    await runDbQuery(
      db,
      `DELETE FROM Game WHERE id = ?`,
      [id]
    );
    console.log(`Game ${id} deleted.`);

    /* --------------------- */
    /*   Commit Transaction  */
    /* --------------------- */
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
