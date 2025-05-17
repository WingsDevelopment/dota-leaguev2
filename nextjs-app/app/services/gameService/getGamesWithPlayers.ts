import { closeDatabase } from "../../../db/initDatabase";
import { getDbInstance } from "../../../db/utils";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse } from "../common/functions";
import { PrimitiveServiceResponse } from "../common/types";
import { queryPromise } from "../common/utils";

/**
 * Returns games with player names.
 *
 * @async
 * @function getGamesWithPlayers
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await deleteGame();
 */
export async function getGamesWithPlayers(): Promise<PrimitiveServiceResponse> {
  /* ----------------- */
  /*   Initialization  */
  /* ----------------- */
  const db = await getDbInstance();
  try {
    // Get all games.
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    const games: Array<Record<string, any>> = await queryPromise(
      db,
      `SELECT * FROM Game`
    );

    if (games.length === 0) {
      /* ---------------- */
      /*   Return Data    */
      /* ---------------- */
      return getSuccessfulServiceResponse({
        message: "No games, returning empty array.",
        data: []
      });
    }

    // Extract game IDs for the IN clause.
    const gameIds = games.map((game) => game.id);
    const placeholders = gameIds.map(() => "?").join(",");

    // Get players for these games, joined with Players.
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
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

    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Fetched games successfully.",
      data: gamesWithPlayers
    });
  } catch (error) {

    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(error, "Error fetching the games.");
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db);
  }
}
