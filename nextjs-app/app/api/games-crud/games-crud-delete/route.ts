import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

export async function DELETE(req: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, result } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "There is no game id" }, { status: 400 });
  }

  const db = await getDbInstance();

  try {
    if (status === "OVER") {
      // Fetch players and their teams from GamePlayers table
      const players = await new Promise((resolve, reject) => {
        db.all(
          `SELECT player_id, team FROM GamePlayers WHERE game_id = ?`,
          [id],
          (err, rows) => {
            if (err) {
              console.error("Error fetching players:", err);
              return reject(err);
            }
            resolve(rows);
          }
        );
      });

      // Update MMR for each player based on game result
      for (const { player_id, team } of players as any) {
        const mmrChange = team === result ? -25 : 25;
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE Players SET mmr = mmr + ? WHERE id = ?`,
            [mmrChange, player_id],
            (err) => {
              if (err) {
                console.error("Error updating MMR:", err);
                return reject(err);
              }
              resolve(null);
            }
          );
        });
      }
    }

    // Delete the game
    await new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM Game WHERE id = ?`,
        [id],
        (err) => {
          if (err) {
            console.error("Error deleting game:", err);
            return reject(err);
          }
          resolve(null);
        }
      );
    });

    db.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    db.close();
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
