import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

interface getPlayerBySteamId {
    discordId: string;
}

export async function getPlayerByDiscordId({ discordId }: getPlayerBySteamId) {
    const db = await getDbInstance();
    try {

        const steamId: Array<Record<string, any>> = await new Promise(
            (resolve, reject) => {
                db.all(
                    `SELECT steam_id FROM Players WHERE discord_id = ?`,
                    [String(discordId)],
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
        return { success: true, data: steamId };
    } catch (error) {
        console.error("Error processing ban/unban:", error);
        closeDatabase(db);
        return { success: false, message: "Internal Server Error" };
    }
}
