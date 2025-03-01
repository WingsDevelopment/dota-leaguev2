import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import { getDbInstance } from "@/db/utils";

export async function GET() {
  try {

     const db = await getDbInstance()

    const leaderboard: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(
          `SELECT discord_id, name, mmr, steam_id
           FROM Players
           ORDER BY mmr DESC`,
          [],
          (err, rows) => {
            if (err) {
              console.error("Error executing query:", err);
              return reject(err);
            }
            resolve(rows as any);
          }
        );
      }
    );

    // Close the database connection.
    db.close();

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error reading leaderboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
