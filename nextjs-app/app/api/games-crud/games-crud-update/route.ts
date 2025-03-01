import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

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
    // Fetch the actual status from the database
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
      db.close();
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (actualGame.status !== status) {
      db.close();
      return NextResponse.json(
        { error: "Game status mismatch. Possible tampering detected." },
        { status: 403 }
      );
    }

    // Get all players from gamePlayers where game_id = id
    const players: Array<{ player_id: number; team: number }> =
      await new Promise((resolve, reject) => {
        db.all(
          `SELECT player_id, team FROM gamePlayers WHERE game_id = ?`,
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
      db.close();
      return NextResponse.json(
        { error: "No players found for this game" },
        { status: 404 }
      );
    }

    // Update MMR based on team result
    await Promise.all(
      players.map(({ player_id, team }) => {
        return new Promise((resolve, reject) => {
          db.run(
            `UPDATE Players SET mmr = mmr + ? WHERE id = ?`,
            [team === team_won ? 25 : -25, player_id],
            (err) => {
              if (err) {
                console.error(
                  `Error updating MMR for player ${player_id}:`,
                  err
                );
                return reject(err);
              }
              resolve(null);
            }
          );
        });
      })
    );

    // Update Game table status to "OVER"
    await new Promise((resolve, reject) => {
      db.run(`UPDATE Game SET status = 'OVER' WHERE id = ?`, [id], (err) => {
        if (err) {
          console.error("Error updating game status:", err);
          return reject(err);
        }
        resolve(null);
      });
    });

    db.close();
    return NextResponse.json({
      success: true,
      message: "MMR updated and game marked as OVER",
    });
  } catch (error) {
    console.error("Error updating MMR and game status:", error);
    db.close();
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
