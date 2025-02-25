import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

export async function GET() {
  // const adminId: string[] = [process.env.ADMIN_ID_1!, process.env.ADMIN_ID_2!]
  //global export of dbPath
  // const session =await  auth()
  // console.log({session})

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

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "There is no game id" }, { status: 400 })
  }

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "db", "league.db");

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
          `DELETE
           FROM Game WHERE id = ?`,
          [id],
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
export async function isUserAdmin(sessionId: string) {
  if (process.env.ADMIN_ID_1 === sessionId) {
    return true
  }
}