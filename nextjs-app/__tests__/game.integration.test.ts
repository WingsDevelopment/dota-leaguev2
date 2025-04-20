// __tests__/game.integration.test.ts
import { initDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { createGameWithPlayers } from "@/app/services/gameService/createGameWithPlayers";
import { getGamesWithPlayers } from "@/app/services/gameService/getGamesWithPlayers";
import { deleteGame } from "@/app/services/gameService/deleteGame";
import { mockPlayers } from "@/app/mocks/playerMock";
import { calculateElo } from "@/app/lib/utils";

// Helpers for tests:
async function clearDatabase() {
  const db = await getDbInstance();
  try {
    await new Promise<void>((resolve, reject) => {
      db.exec("DELETE FROM Game; DELETE FROM GamePlayers; DELETE FROM Players;", (err) =>
        err ? reject(err) : resolve()
      );
    });
  } finally {
    // In test, we do not close the shared in-memory DB.
  }
}

async function seedPlayers() {
  const db = await getDbInstance();
  try {
    const insertPlayer = `
      INSERT INTO Players(discord_id, steam_id, name, mmr, captain)
      VALUES(?,?,?,?,?)
    `;
    for (const player of mockPlayers.leaderboard) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          insertPlayer,
          [player.discord_id, player.steam_id, player.name, player.mmr, player.captain],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }
  } finally {
    // Do not close in test.
  }
}

// Helper to update a game’s status manually.
async function updateGameStatus(
  gameId: number,
  status: string,
  result: number | null = null
) {
  const db = await getDbInstance();
  try {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE Game SET status = ?, result = ? WHERE id = ?`,
        [status, result, gameId],
        (err) => (err ? reject(err) : resolve())
      );
    });
  } finally {
    // Do not close in test.
  }
}

// Helper to get a player's MMR.
async function getPlayerMmr(playerId: number): Promise<number> {
  const db = await getDbInstance();
  try {
    return await new Promise<number>((resolve, reject) => {
      db.get(`SELECT mmr FROM Players WHERE id = ?`, [playerId], (err, row) =>
        err ? reject(err) : resolve((row as { mmr: number }).mmr)
      );
    });
  } finally {
    // Do not close in test.
  }
}

describe("Game Service - DELETE and Elo Reversion Tests", () => {
  beforeAll(async () => {
    console.log("Initializing database schema...");
    await initDatabase();
  });

  beforeEach(async () => {
    console.log("Clearing database and seeding players...");
    await clearDatabase();
    await seedPlayers();
  });

  test("should delete non-OVER games without changing player MMR", async () => {
    const statuses = ["PREGAME", "HOSTED", "STARTED", "ABORTED", "CANCEL", "REHOST"];
    const gameIds: Record<string, number> = {};

    // Create a game for each non-OVER status.
    for (const status of statuses) {
      const gameId = await createGameWithPlayers();
      console.log(`Created game ${gameId} with default status PREGAME.`);
      if (status !== "PREGAME") {
        await updateGameStatus(gameId, status, null);
        console.log(`Updated game ${gameId} to status ${status}.`);
      }
      gameIds[status] = gameId;
    }

    // Verify games exist.
    let games = await getGamesWithPlayers();
    console.log("Games before deletion:", games);
    expect(games.length).toBe(statuses.length);

    // For each game, record initial player MMR and delete the game.
    for (const status of statuses) {
      const db = await getDbInstance();
      const playersData: Array<{ player_id: number; team: number }> = await new Promise(
        (resolve, reject) => {
          db.all(
            `SELECT player_id, team FROM GamePlayers WHERE game_id = ?`,
            [gameIds[status]],
            (err, rows) => (err ? reject(err) : resolve(rows as any))
          );
        }
      );
      const initialMmrs: Record<number, number> = {};
      for (const { player_id } of playersData) {
        initialMmrs[player_id] = await getPlayerMmr(player_id);
      }
      console.log(
        `Initial MMR for game ${gameIds[status]} (status ${status}):`,
        initialMmrs
      );

      const res = await deleteGame({
        id: gameIds[status],
        status,
        result: null,
      });
      console.log(`Deleted game ${gameIds[status]} with status ${status}.`, res);
      expect(res.success).toBe(true);

      // Verify that the game is deleted.
      const db2 = await getDbInstance();
      const gameRow = await new Promise((resolve, reject) => {
        db2.get(`SELECT id FROM Game WHERE id = ?`, [gameIds[status]], (err, row) =>
          err ? reject(err) : resolve(row)
        );
      });
      expect(gameRow).toBeUndefined();

      // For non-OVER games, MMR should remain unchanged.
      for (const { player_id } of playersData) {
        const finalMmr = await getPlayerMmr(player_id);
        console.log(
          `Game ${gameIds[status]} - Player ${player_id}: initial MMR ${initialMmrs[player_id]}, final MMR ${finalMmr}`
        );
        expect(finalMmr).toBe(initialMmrs[player_id]);
      }
    }
  });

  test("should revert player MMR using Elo when deleting an OVER game", async () => {
    // Create an OVER game.
    const gameId = await createGameWithPlayers();
    // Update its status to OVER with result = 0 (i.e., team 0 wins).
    await updateGameStatus(gameId, "OVER", 0);
    console.log(`Created and updated game ${gameId} to OVER with result 0.`);

    // Get players for this game along with their current mmr.
    const db = await getDbInstance();
    const players: Array<{ player_id: number; team: number; mmr: number }> =
      await new Promise((resolve, reject) => {
        db.all(
          `SELECT gp.player_id, gp.team, p.mmr 
         FROM GamePlayers gp 
         JOIN Players p ON gp.player_id = p.id 
         WHERE gp.game_id = ?`,
          [gameId],
          (err, rows) => (err ? reject(err) : resolve(rows as any))
        );
      });
    console.log("Players in OVER game before deletion:", players);

    // Record initial MMR values.
    const initialMmrs: Record<number, number> = {};
    for (const { player_id, mmr } of players) {
      initialMmrs[player_id] = mmr;
    }
    console.log("Initial MMRs:", initialMmrs);

    // For Elo calculation, compute average MMR per team.
    const radiantPlayers = players.filter((p) => p.team === 0);
    const direPlayers = players.filter((p) => p.team === 1);
    const radiantAvg =
      radiantPlayers.reduce((sum, p) => sum + p.mmr, 0) / radiantPlayers.length;
    const direAvg = direPlayers.reduce((sum, p) => sum + p.mmr, 0) / direPlayers.length;
    const eloChange = calculateElo(radiantAvg, direAvg, 1); // result=0 means Radiant wins => parameter=1.
    console.log(`Calculated Elo change for game ${gameId}: ${eloChange}`);

    // Delete the OVER game.
    const delRes = await deleteGame({ id: gameId, status: "OVER", result: 0 });
    console.log(`Deleted OVER game ${gameId}.`, delRes);
    expect(delRes.success).toBe(true);

    // Verify the game is deleted.
    const db2 = await getDbInstance();
    const gameRow = await new Promise((resolve, reject) => {
      db2.get(`SELECT id FROM Game WHERE id = ?`, [gameId], (err, row) =>
        err ? reject(err) : resolve(row)
      );
    });
    expect(gameRow).toBeUndefined();

    // Verify player MMR values are reverted: For winning team (team 0), subtract eloChange; for losing team, add eloChange.
    for (const { player_id, team } of players) {
      const finalMmr = await getPlayerMmr(player_id);
      const expected =
        team === 0
          ? initialMmrs[player_id] - eloChange
          : initialMmrs[player_id] + eloChange;
      console.log(
        `OVER game - Player ${player_id} (team ${team}): initial MMR ${initialMmrs[player_id]}, expected final MMR ${expected}, actual final MMR ${finalMmr}`
      );
      expect(finalMmr).toBe(expected);
    }
  });
});
