import { isUserAdmin } from "@/app/common/constraints";
import { closeDatabase } from "@/db/initDatabase";
import { getDbInstance } from "@/db/utils";
import { NextResponse } from "next/server";
import path from "path";
import sqlite3 from "sqlite3";

// export const ADMIN_IDS = [1, 2];

// TODO DELETE ASAP/ OR MAKE ADMIN ACTION
export async function POST() {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDbInstance();
  try {
    // Execute update query wrapped in a promise
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE SteamBots SET status = 0 WHERE id = ?`,
        [1],
        function (err) {
          if (err) {
            console.error("Error updating bot status:", err);
            return reject(err);
          }
          resolve();
        }
      );
    });

    // Close the database connection.


    return NextResponse.json({
      success: true,
      message: "Bot status updated to 0",
    });
  } catch (error) {
    console.error("Error updating bot status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    closeDatabase(db);
  }
}
