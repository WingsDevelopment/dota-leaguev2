import { closeDatabase } from "../../../db/initDatabase";
import { getDbInstance } from "../../../db/utils";
import { queryPromise } from "../common/utils";

/**
 * Retrieves all games from the database with their players, grouped by team.
 */
export async function getGamesWithPlayers(): Promise<any[]> {
  const db = await getDbInstance();
  try {
    // Get all games.
    const games: Array<Record<string, any>> = await queryPromise(
      db,
      `SELECT * FROM Game`
    );

    if (games.length === 0) {
      closeDatabase(db);
      return [];
    }

    // Extract game IDs for the IN clause.
    const gameIds = games.map((game) => game.id);
    const placeholders = gameIds.map(() => "?").join(",");

    // Get players for these games, joined with Players.
    const gamePlayers = await queryPromise(
      db,
      `SELECT gp.game_id, p.name, gp.team
         FROM GamePlayers gp
         JOIN Players p ON gp.player_id = p.id
         WHERE gp.game_id IN (${placeholders})`,
      gameIds
    );

    // Group players by game id, splitting into radiant (team 0) and dire (team 1)
    const gamePlayersByGame: Record<
      number,
      { radiant: string[]; dire: string[] }
    > = {};
    gamePlayers.forEach((player) => {
      if (!gamePlayersByGame[player.game_id]) {
        gamePlayersByGame[player.game_id] = { radiant: [], dire: [] };
      }
      if (player.team === 0) {
        gamePlayersByGame[player.game_id].radiant.push(player.name);
      } else {
        gamePlayersByGame[player.game_id].dire.push(player.name);
      }
    });

    // Attach player lists to each game.
    const gamesWithPlayers = games.map((game) => ({
      ...game,
      players: gamePlayersByGame[game.id] || { radiant: [], dire: [] },
    }));

    closeDatabase(db);
    return gamesWithPlayers;
  } catch (error) {
    closeDatabase(db);
    throw error;
  }
}
