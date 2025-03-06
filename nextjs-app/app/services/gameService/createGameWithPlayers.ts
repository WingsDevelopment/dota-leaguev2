import { closeDatabase } from "../../../db/initDatabase";
import { getDbInstance } from "../../../db/utils";
import { mockPlayers } from "../../mocks/playerMock";
import { addPlayerToGame, getPlayerId } from "../common/utils";

/**
 * Creates a new game, assigns players from the mockPlayers list and returns the new game ID.
 */
export async function createGameWithPlayers(): Promise<number> {
  const db = await getDbInstance();
  try {
    // Insert a new game with default properties.
    const createGame: number = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO Game(status, result, steam_match_id, type) VALUES(?, ?, ?, ?)`,
        ["PREGAME", null, null, "NORMAL"],
        function (err) {
          if (err) {
            console.error("Error creating game:", err);
            return reject(err);
          }
          resolve(this.lastID);
        }
      );
    });

    // For testing: assign 10 players from our mockPlayers.
    // First 5 are team 0 (Radiant), next 5 are team 1 (Dire).
    const playersToAssign = mockPlayers.leaderboard.slice(0, 10);
    const radiantPlayers = playersToAssign.slice(0, 5);
    const direPlayers = playersToAssign.slice(5, 10);
    const assignPromises: Promise<void>[] = [];

    // Process radiant players.
    for (const player of radiantPlayers) {
      const playerId = await getPlayerId(db, player.discord_id);
      if (playerId === null) {
        console.warn(
          `Player with discord_id ${player.discord_id} not found. Skipping.`
        );
        continue;
      }
      assignPromises.push(addPlayerToGame(db, createGame, playerId, 0));
    }
    // Process dire players.
    for (const player of direPlayers) {
      const playerId = await getPlayerId(db, player.discord_id);
      if (playerId === null) {
        console.warn(
          `Player with discord_id ${player.discord_id} not found. Skipping.`
        );
        continue;
      }
      assignPromises.push(addPlayerToGame(db, createGame, playerId, 1));
    }
    await Promise.all(assignPromises);
    return createGame;
  } finally {
    closeDatabase(db);
  }
}
