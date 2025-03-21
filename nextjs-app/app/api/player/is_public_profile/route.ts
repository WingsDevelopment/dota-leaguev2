import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { closeDatabase } from "@/db/initDatabase";

export async function GET(req: Request) {
  const db = await getDbInstance();


  try {
    const url = new URL(req.url);
    const steamid = url.searchParams.get("steam_id");
    const isPublicProfile: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(`SELECT discord_id, is_public_profile FROM Players WHERE steam_id = ?`, [steamid], (err, rows) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }
          resolve(rows as any);
        });
      }
    );

    closeDatabase(db);
    return NextResponse.json({ isPublicProfile });
  } catch (error) {


    console.error("Error reading games:", error);
    closeDatabase(db);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
