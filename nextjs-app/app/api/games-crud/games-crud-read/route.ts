import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

export async function GET() {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDbInstance();

  try {
    // Use the environment variable if set.

    // Execute the game query.
    const games: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(`SELECT * FROM Game`, [], (err, rows) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }
          resolve(rows as any);
        });
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
