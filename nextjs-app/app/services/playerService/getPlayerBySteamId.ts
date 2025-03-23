import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

interface getPlayerBySteamId {
    steamId: string;
}

export async function getPlayerBySteamId({ steamId }: getPlayerBySteamId) {
    const db = await getDbInstance();
    try {

        const player: Array<Record<string, any>> = await new Promise(
            (resolve, reject) => {
                db.all(
                    `SELECT * FROM Players WHERE steam_id = ?`,
                    [String(steamId)],
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

        closeDatabase(db);
        return { success: true, data: player };
    } catch (error) {
        console.error("Error processing ban/unban:", error);
        closeDatabase(db);
        return { success: false, message: "Internal Server Error" };
    }
}
