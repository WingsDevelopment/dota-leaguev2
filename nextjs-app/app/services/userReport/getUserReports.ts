import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";


export async function getUserReports() {
  const db = await getDbInstance();
  try {

    const reports: Array<Record<string, any>> = await new Promise(
      (resolve, reject) => {
        db.all(`SELECT 
    ur.id,
    p1.name AS reporter_name, 
    p2.name AS reported_name, 
    ur.type, 
    ur.match_id, 
    ur.report, 
    ur.reviewed, 
    ur.time
FROM UserReport ur
LEFT JOIN Players p1 ON ur.steam_id = p1.steam_id
LEFT JOIN Players p2 ON ur.other_player_steam_id = p2.steam_id;`, [], (err, rows) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }
          resolve(rows as any);
        });
      }
    );

    closeDatabase(db);
    return { success: true, data: reports };
  } catch (error) {
    console.error("Error processing user reports:", error);
    closeDatabase(db);
    return { success: false, message: "Internal Server Error" };
  }
}
