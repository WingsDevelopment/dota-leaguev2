import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
// import { auth } from "@/auth";

// export const ADMIN_IDS = ["1", "2"]
export async function GET() {
  //global export of dbPath
  // const session = await auth(); // inicijalizujemo session
  // if (!ADMIN_IDS.some(id => id=== session?.user?.id)) throw new Error("Unauthorized access") 
  //some ocekuje callback function a odje passujemo session.user.id direktno

  const dbPath =
    process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

  // Open the SQLite database.
  // consider export from one funcstion, then just call getDbInstance();
  const db = await new Promise<sqlite3.Database>((resolve, reject) => {
    const instance = new sqlite3.Database(
      dbPath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          console.error("Error opening database:", err);
          return reject(err);
        }
        resolve(instance);
      }
    );
  });

  try {
    // Use the environment variable if set.

    // Execute the game query.
    const games: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(
          `SELECT *
           FROM Game`,
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

    return NextResponse.json({ games });
  } catch (error) {
    db.close();

    console.error("Error reading games:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
