import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";


export async function getUserReports() {
    const db = await getDbInstance();
    try {

        const reports: Array<Record<string, any>> = await new Promise(
            (resolve, reject) => {
              db.all(`SELECT * FROM UserReport`, [], (err, rows) => {
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
