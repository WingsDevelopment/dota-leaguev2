import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

// Our mock players.
const mockPlayers = {
  leaderboard: [
    {
      discord_id: "156018234942816256",
      name: "sorry",
      mmr: 1080,
      steam_id: "76561198052417128",
      captain: 1,
    },
    {
      discord_id: "426873786223034369",
      name: "psajk",
      mmr: 1077,
      steam_id: "76561198135951237",
      captain: 1,
    },
    {
      discord_id: "458944687953281044",
      name: "Vidjen",
      mmr: 1074,
      steam_id: "76561198040679981",
      captain: 1,
    },
    {
      discord_id: "328855745187807233",
      name: "MINIPANI",
      mmr: 1050,
      steam_id: "76561198272207056",
      captain: 1,
    },
    {
      discord_id: "261319928320098304",
      name: "cowboydota",
      mmr: 1027,
      steam_id: "76561198135923507",
      captain: 1,
    },
    {
      discord_id: "282228439052713984",
      name: "Ma Ne",
      mmr: 1025,
      steam_id: "76561198143559772",
      captain: 0,
    },
    {
      discord_id: "441698961992974353",
      name: "Rayc",
      mmr: 1025,
      steam_id: "76561198046447733",
      captain: 0,
    },
    {
      discord_id: "689908000722387143",
      name: "Lakarije",
      mmr: 1025,
      steam_id: "76561198955786119",
      captain: 0,
    },
    {
      discord_id: "1099837812699840512",
      name: "Retrox",
      mmr: 1025,
      steam_id: "76561198091045889",
      captain: 0,
    },
    {
      discord_id: "1304216877794459739",
      name: "xndRRR",
      mmr: 1024,
      steam_id: "76561198074948057",
      captain: 0,
    },
    // ... additional players if needed.
  ],
};

// Utility function to run queries and return a promise.
async function queryPromise(
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

// Helper function to get a player's internal id from the database.
// Declared as an arrow function outside of any blocks.
const getPlayerId = async (
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

// Helper function to add a player to a game.
// Declared as an arrow function outside of any blocks.
const addPlayerToGame = async (
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

export async function GET() {
  // Only admins may view the games.
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDbInstance();
  try {
    // Get all games.
    const games: Array<Record<string, any>> = await queryPromise(
      db,
      `SELECT * FROM Game`
    );

    if (games.length === 0) {
      db.close();
      return NextResponse.json({ games: [] });
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

    db.close();
    return NextResponse.json({ games: gamesWithPlayers });
  } catch (error) {
    db.close();
    console.error("Error reading games:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Only admins may create games.
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
    // Wait for all assignments.
    await Promise.all(assignPromises);

    db.close();
    return NextResponse.json({
      gameId: createGame,
      message: "Game created with players assigned",
    });
  } catch (error) {
    db.close();
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
