import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";

interface MatchHistoryParams {
    steamId: string;
}

export async function MatchHistory({
    steamId,
}: MatchHistoryParams): Promise<{ success: boolean; data?: any; message?: string }> {
    const db = await getDbInstance();

    try {
        // Fetch match details and player stats in a single query
        const matchHistory = await new Promise<Array<Record<string, any>>>((resolve, reject) => {
            db.all(
                `SELECT 
                    mh.id, mh.match_id, mh.league_id, mh.start_time, mh.duration, mh.game_mode, 
                    mh.lobby_type, mh.region, mh.winner, mh.radiant_score, mh.dire_score, mh.additional_info,
                    mps.hero_id, mps.kills, mps.deaths, mps.assists, mps.items
                 FROM MatchHistory mh
                 JOIN MatchPlayerStats mps ON mh.id = mps.match_history_id
                 WHERE mps.steam_id = ?`,
                [steamId],
                (err, rows) => {
                    if (err) {
                        console.error("Error fetching match history:", err);
                        reject(err);
                    } else {
                        resolve(rows as any);
                    }
                }
            );
        });
        closeDatabase(db);
        return { success: true, data: matchHistory };
    } catch (error) {
        console.error("Error processing deleteGame:", error);

        closeDatabase(db);
        return { success: false, message: "Failed to fetch match history" };
    }
}
