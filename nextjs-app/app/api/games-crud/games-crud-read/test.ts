import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { getGamesWithPlayers } from "../../../services/gameService/getGamesWithPlayers";
import { closeDatabase } from "@/db/initDatabase";

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

    
    return NextResponse.json({
      gameId: createGame,
      message: "Game created with players assigned",
    });
  } catch (error) {
    
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }finally{
    closeDatabase(db);
  }
}
