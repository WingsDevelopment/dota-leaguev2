import { NextResponse } from "next/server";
import { getDbInstance } from "../../../../db/utils";
import { closeDatabase } from "../../../../db/initDatabase";

export async function GET() {
  const db = await getDbInstance();

  try {
    const matchPlayerHistory: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(`SELECT * FROM MatchPlayerStats`, [], (err, rows) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }
          resolve(rows as any);
        });
      }
    );

    closeDatabase(db);

    return NextResponse.json({ matchPlayerHistory });
  } catch (error) {
    closeDatabase(db);
    console.error("Error reading match history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
