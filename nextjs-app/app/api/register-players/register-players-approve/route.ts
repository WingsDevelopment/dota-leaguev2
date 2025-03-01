import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { auth } from "../../../../auth";

export async function POST(req: NextRequest) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { registrationId } = await req.json();
  if (!registrationId) {
    return NextResponse.json(
      { error: "Missing registrationId" },
      { status: 400 }
    );
  }

  const db = await getDbInstance();
  try {
    // Check if the registration exists and is pending
    const registration: any = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM RegisterPlayers WHERE id = ? AND status = 'PENDING'",
        [registrationId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found or already processed" },
        { status: 404 }
      );
    }

    // Check if the player already exists in Players
    const playerExists: any = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id FROM Players WHERE steam_id = ?",
        [registration.steam_id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (playerExists) {
      // Update the registration status to APPROVED
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE RegisterPlayers SET status = 'APPROVED' WHERE id = ?",
          [registrationId],
          function (err) {
            if (err) reject(err);
            resolve(this.changes);
          }
        );
      });
      return NextResponse.json({
        message: "Player already exists in Players, registration approved.",
      });
    }

    // Insert into Players with mmr 1000
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO Players (discord_id, steam_id, name, mmr) VALUES (?, ?, ?, 1000)",
        [registration.discord_id, registration.steam_id, registration.name],
        function (err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    // Update the registration status to APPROVED
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE RegisterPlayers SET status = 'APPROVED' WHERE id = ?",
        [registrationId],
        function (err) {
          if (err) reject(err);
          resolve(this.changes);
        }
      );
    });

    db.close();
    return NextResponse.json({
      message: "Player approved and added to Players.",
    });
  } catch (error) {
    db.close();
    console.error("Error approving player:", error);
    return NextResponse.json(
      { error: `Internal Server Error ${error}` },
      { status: 500 }
    );
  }
}
