import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";
import { calculateElo } from "../../lib/utils";

interface DeleteGameParams {
  id: number;
  status: string;
  result: number | null;
}

export async function deleteGame({
  id,
  status,
  result,
}: DeleteGameParams): Promise<{ success: boolean; message?: string }> {
  const db = await getDbInstance();
  try {
    console.log(
      `Starting deletion for game ${id} with status "${status}" and result ${result}`
    );

    // Begin transaction.
    await new Promise<void>((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err) => (err ? reject(err) : resolve()));
    });

    // Check if the game exists.
    const gameExists = await new Promise<any>((resolve, reject) => {
      db.get(`SELECT id FROM Game WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!gameExists) {
      console.log(`Game ${id} does not exist. Rolling back.`);
      await new Promise<void>((resolve, reject) => {
        db.run("ROLLBACK", (err) => (err ? reject(err) : resolve()));
      });
      closeDatabase(db);
      return { success: false, message: "Game already deleted" };
    }

    // If the game is in "OVER" status, update player MMR values using calculateElo.
    if (status === "OVER" && result !== null) {
      console.log("Game is OVER. Recalculating Elo for players...");
      // Fetch players with their current MMR.
      const players: Array<{ player_id: number; team: number; mmr: number }> =
        await new Promise((resolve, reject) => {
          db.all(
            `SELECT gp.player_id, gp.team, p.mmr 
           FROM GamePlayers gp 
           JOIN Players p ON gp.player_id = p.id 
           WHERE gp.game_id = ?`,
            [id],
            (err, rows) => (err ? reject(err) : resolve(rows as any))
          );
        });
      console.log("Players fetched for Elo recalculation:", players);

      // Separate players by team.
      const radiantPlayers = players.filter((p) => p.team === 0);
      const direPlayers = players.filter((p) => p.team === 1);

      // Compute average MMR for each team.
      const radiantAvg =
        radiantPlayers.length > 0
          ? radiantPlayers.reduce((sum, p) => sum + p.mmr, 0) / radiantPlayers.length
          : 0;
      const direAvg =
        direPlayers.length > 0
          ? direPlayers.reduce((sum, p) => sum + p.mmr, 0) / direPlayers.length
          : 0;
      console.log(`Radiant average MMR: ${radiantAvg}, Dire average MMR: ${direAvg}`);

      // Calculate Elo change.
      // Using the same logic as your PUT route: if result === 0 (Radiant wins), then parameter is 1; if result === 1 (Dire wins), parameter is -1.
      const eloChange = calculateElo(radiantAvg, direAvg, result === 0 ? 1 : -1);
      console.log(`Calculated Elo change: ${eloChange}`);

      // Update each player's MMR in reverse.
      for (const { player_id, team } of players) {
        // Revert the change: if player's team equals the winning team (result) then subtract eloChange; otherwise add eloChange.
        const adjustment = team === result ? -eloChange : eloChange;
        console.log(
          `Updating player ${player_id} (team ${team}): applying adjustment ${adjustment}`
        );
        if (team === result) {
          await new Promise<void>((resolve, reject) => {
            db.run(
              `UPDATE Players SET mmr = mmr + ?, wins = wins - 1 WHERE id = ?`,
              [adjustment, player_id],
              (err) => (err ? reject(err) : resolve())
            );
          });
        } else {
          await new Promise<void>((resolve, reject) => {
            db.run(
              `UPDATE Players SET mmr = mmr + ?, loses = loses - 1 WHERE id = ?`,
              [adjustment, player_id],
              (err) => (err ? reject(err) : resolve())
            );
          });
        }
      }
    } else {
      console.log(`Game ${id} is not in OVER status; no Elo changes to revert.`);
    }

    // Delete the game.
    await new Promise<void>((resolve, reject) => {
      db.run(`DELETE FROM Game WHERE id = ?`, [id], (err) =>
        err ? reject(err) : resolve()
      );
    });
    console.log(`Game ${id} deleted.`);

    // Commit transaction.
    await new Promise<void>((resolve, reject) => {
      db.run("COMMIT", (err) => (err ? reject(err) : resolve()));
    });

    closeDatabase(db);
    return { success: true };
  } catch (error) {
    console.error("Error processing deleteGame:", error);
    // Rollback if there is any error.
    await new Promise<void>((resolve, reject) => {
      db.run("ROLLBACK", (err) => (err ? reject(err) : resolve()));
    });
    closeDatabase(db);
    throw error;
  }
}
