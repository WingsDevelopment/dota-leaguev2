import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

export async function GET() {
  const db = await getDbInstance();

  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use the environment variable if set.

    // Execute the game query.
    const registerPlayers: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(`SELECT * FROM RegisterPlayers`, [], (err, rows) => {
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

    return NextResponse.json({ registerPlayers });
  } catch (error) {
    db.close();

    console.error("Error reading games:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
