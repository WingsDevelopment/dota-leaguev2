import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";

interface getPlayerBySteamId {
    steamId: string;
}
enum LikeType {
    LIKE = 1,
    DISLIKE = 0
}
export async function getPlayerLikesAndDislikes({ steamId }: getPlayerBySteamId) {
    const db = await getDbInstance();
    try {
        const likeDislikeRows: Array<Record<string, any>> = await new Promise((resolve, reject) => {
            db.all(
                `SELECT likes_dislikes FROM likeDislike WHERE other_player_steam_id = ?`,
                [String(steamId)],
                (err, rows) => {
                    if (err) {
                        console.error("Error executing query:", err);
                        return reject(err);
                    }
                    resolve(rows as any);
                }
            );
        });

        let likes = 0;
        let dislikes = 0;

        likeDislikeRows.forEach((row) => {
            if (row.likes_dislikes === LikeType.LIKE) {
                likes++;
            } else if (row.likes_dislikes === LikeType.DISLIKE) {
                dislikes++;
            }
        });

        closeDatabase(db);
        return { success: true, data: { likes, dislikes } };
    } catch (error) {
        console.error("Error processing likes/dislikes:", error);
        closeDatabase(db);
        return { success: false, message: "Error processing likes/dislikes" };
    }
}
