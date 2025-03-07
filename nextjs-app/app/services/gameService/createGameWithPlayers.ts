// Updated createGameWithPlayers.ts
import { closeDatabase } from "../../../db/initDatabase";
import { getDbInstance } from "../../../db/utils";
import { mockPlayers } from "../../mocks/playerMock";
import { addPlayerToGame, getPlayerId } from "../common/utils";

/**
 * Creates a new game and assigns players to teams.
 * @param direTeam Optional array of discord_ids for the Dire team.
 * @param radiantTeam Optional array of discord_ids for the Radiant team.
 * @returns The new game ID.
 * @throws If only one of direTeam or radiantTeam is provided.
 */
export async function createGameWithPlayers(
  direTeam: string[] | null = null,
  radiantTeam: string[] | null = null,
  status: string = "PREGAME"
): Promise<number> {
  // If one is provided without the other, throw an error.
  if ((direTeam && !radiantTeam) || (!direTeam && radiantTeam)) {
    throw new Error(
      "Both direTeam and radiantTeam must be provided if one is provided."
    );
  }

  const db = await getDbInstance();
  try {
    // Insert a new game with default properties.
    const createGame: number = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO Game(status, result, steam_match_id, type) VALUES(?, ?, ?, ?)`,
        [status, null, null, "NORMAL"],
        function (err) {
          if (err) {
            console.error("Error creating game:", err);
            return reject(err);
          }
          resolve(this.lastID);
        }
      );
    });

    // Determine the teams to assign.
    let radiantDiscordIds: string[];
    let direDiscordIds: string[];

    if (!direTeam && !radiantTeam) {
      // If no teams provided, use mockPlayers (first 10 players).
      const playersToAssign = mockPlayers.leaderboard.slice(0, 10);
      radiantDiscordIds = playersToAssign
        .slice(0, 5)
        .map((player) => player.discord_id);
      direDiscordIds = playersToAssign
        .slice(5, 10)
        .map((player) => player.discord_id);
    } else {
      // Both teams provided.
      radiantDiscordIds = radiantTeam!;
      direDiscordIds = direTeam!;
    }

    const assignPromises: Promise<void>[] = [];

    // Process Radiant players.
    for (const discord_id of radiantDiscordIds) {
      const playerId = await getPlayerId(db, discord_id);
      if (playerId === null) {
        console.warn(
          `Player with discord_id ${discord_id} not found. Skipping.`
        );
        continue;
      }
      assignPromises.push(addPlayerToGame(db, createGame, playerId, 0));
    }

    // Process Dire players.
    for (const discord_id of direDiscordIds) {
      const playerId = await getPlayerId(db, discord_id);
      if (playerId === null) {
        console.warn(
          `Player with discord_id ${discord_id} not found. Skipping.`
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
