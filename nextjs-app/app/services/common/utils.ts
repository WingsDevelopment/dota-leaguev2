import sqlite3 from "sqlite3";

// Helper function to add a player to a game.
export const addPlayerToGame = async (
  db: sqlite3.Database,
  gameId: number,
  playerId: number,
  team: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO GamePlayers(game_id, player_id, team) VALUES(?, ?, ?)`,
      [gameId, playerId, team],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

// Helper function to get a player's internal id from the database.
export const getPlayerId = async (
  db: sqlite3.Database,
  discordId: string
): Promise<number | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM Players WHERE discord_id = ?`,
      [discordId],
      (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? (row as { id: number }).id : null);
      }
    );
  });
};

// Utility function to run queries and return a promise.
export async function queryPromise(
  db: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error("Error executing query:", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
}
