import { NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { closeDatabase } from "@/db/initDatabase";
import { getUnauthorizedError } from "../common/functions";

export async function GET() {
  const db = await getDbInstance();
  if (!(await isUserAdmin())) {
    return getUnauthorizedError();
  }

  try {
    const result: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(`SELECT * FROM SteamBots`, [], (err, rows) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }
          resolve(rows as any);
        });
      }
    );


    return NextResponse.json({ result });
  } catch (error) {

    console.error("Error reading bots:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    closeDatabase(db)
  }

}
