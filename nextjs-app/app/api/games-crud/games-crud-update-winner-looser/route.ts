import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { calculateElo } from "../../../lib/utils";
import { closeDatabase } from "@/db/initDatabase";

export async function PUT(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, team_won, status } = await req.json();

  if (!id || team_won === undefined || !status) {
    return NextResponse.json(
      { error: "Missing game id, team_won, or status" },
      { status: 400 }
    );
  }

  const db = await getDbInstance();

  try {
    // Fetch the actual status from the database.
    const actualGame: { status: string } | undefined = await new Promise(
      (resolve, reject) => {
        db.get(`SELECT status FROM Game WHERE id = ?`, [id], (err, row) => {
          if (err) {
            console.error("Error fetching game status:", err);
            return reject(err);
          }
          resolve(row as any);
        });
      }
    );

    if (!actualGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Start a transaction.
    await new Promise((resolve, reject) =>
      db.run("BEGIN TRANSACTION", (err) => (err ? reject(err) : resolve(null)))
    );

    // Get all players (including their current mmr) for the game.
    const players: Array<{ player_id: number; team: number; mmr: number }> =
      await new Promise((resolve, reject) => {
        db.all(
          `SELECT gp.player_id, gp.team, p.mmr 
           FROM gamePlayers gp 
           JOIN Players p ON gp.player_id = p.id 
           WHERE gp.game_id = ?`,
          [id],
          (err, rows) => {
            if (err) {
              console.error("Error fetching players:", err);
              return reject(err);
            }
            resolve(rows as any);
          }
        );
      });

    if (players.length === 0) {
      // Rollback if no players found.
      await new Promise((resolve, reject) =>
        db.run("ROLLBACK", (err) => (err ? reject(err) : resolve(null)))
      );
      return NextResponse.json(
        { error: "No players found for this game" },
        { status: 404 }
      );
    }

    // Split players into two teams.
    const radiantPlayers = players.filter((p) => p.team === 0);
    const direPlayers = players.filter((p) => p.team === 1);

    if (radiantPlayers.length === 0 || direPlayers.length === 0) {
      await new Promise((resolve, reject) =>
        db.run("ROLLBACK", (err) => (err ? reject(err) : resolve(null)))
      );
      return NextResponse.json(
        { error: "Insufficient players to calculate Elo" },
        { status: 400 }
      );
    }

    // Calculate the average MMR for each team.
    const radiantAvg =
      radiantPlayers.reduce((sum, p) => sum + p.mmr, 0) / radiantPlayers.length;
    const direAvg = direPlayers.reduce((sum, p) => sum + p.mmr, 0) / direPlayers.length;

    // Compute the ELO change.
    // team_won is assumed to be 0 (radiant wins) or 1 (dire wins).
    const eloChange = calculateElo(radiantAvg, direAvg, team_won === 0 ? 1 : -1);

    // Update MMR, wins, and loses for each player based on the match result.
    await Promise.all(
      players.map(({ player_id, team }) => {
        return new Promise((resolve, reject) => {
          if (team === team_won) {
            // For the winning team, increase mmr, wins, and streak.
            db.run(
              `UPDATE Players SET mmr = mmr + ?, wins = wins + 1, streak = streak + 1 WHERE id = ?`,
              [eloChange, player_id],
              (err) => {
                if (err) {
                  console.error(`Error updating winning player ${player_id}:`, err);
                  return reject(err);
                }
                resolve(null);
              }
            );
          } else {
            // For the losing team, decrease mmr, increase loses and reset streak.
            db.run(
              `UPDATE Players SET mmr = mmr - ?, loses = loses + 1, streak = 0 WHERE id = ?`,
              [eloChange, player_id],
              (err) => {
                if (err) {
                  console.error(`Error updating losing player ${player_id}:`, err);
                  return reject(err);
                }
                resolve(null);
              }
            );
          }
        });
      })
    );

    // Update Game table status to "OVER" with the match result.
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE Game SET result = ?, status = 'OVER', steam_match_id = ? WHERE id = ?`,
        [team_won, -1, id],
        (err) => {
          if (err) {
            console.error("Error updating game status:", err);
            return reject(err);
          }
          resolve(null);
        }
      );
    });

    // Commit the transaction.
    await new Promise((resolve, reject) =>
      db.run("COMMIT", (err) => (err ? reject(err) : resolve(null)))
    );

    // Now close the database connection.
    closeDatabase(db);

    return NextResponse.json({
      success: true,
      message: "MMR updated and game marked as OVER",
    });
  } catch (error) {
    console.error("Error updating MMR and game status:", error);
    // Rollback transaction in case of error.
    await new Promise((resolve, reject) =>
      db.run("ROLLBACK", (err) => (err ? reject(err) : resolve(null)))
    );
    closeDatabase(db);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
