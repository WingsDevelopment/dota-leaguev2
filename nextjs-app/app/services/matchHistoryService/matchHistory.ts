import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";

interface MatchHistoryParams {
  steamId: string;
}

export async function MatchHistory({
  steamId,
}: MatchHistoryParams): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  const db = await getDbInstance();

  try {
    // Fetch match details and player stats in a single query
    // and sort by start_time descending (most recent first)
    const matchHistory = await new Promise<Array<Record<string, any>>>(
      (resolve, reject) => {
        db.all(
          `SELECT 
            mh.id, mh.match_id, mh.league_id, mh.start_time, mh.duration, mh.game_mode, 
            mh.lobby_type, mh.region, mh.winner, mh.radiant_score, mh.dire_score, mh.additional_info,
            mps.hero_id, mps.kills, mps.deaths, mps.assists, mps.items
         FROM MatchHistory mh
         JOIN MatchPlayerStats mps ON mh.id = mps.match_history_id
         WHERE mps.steam_id = ?
         ORDER BY mh.start_time DESC`,
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
      }
    );

    // Process each match to add a win/loss result from the player's perspective
    const processedMatches = matchHistory.map((match) => {
      let result = "Unknown";
      try {
        // Parse the additional_info JSON to extract picks_bans data
        const additional = JSON.parse(match.additional_info);
        if (Array.isArray(additional.picks_bans)) {
          // Find the pick corresponding to the player's hero_id
          const playerPick = additional.picks_bans.find(
            (pb: any) =>
              pb.is_pick && Number(pb.hero_id) === Number(match.hero_id)
          );
          if (playerPick !== undefined) {
            // Determine player's team: team 0 = radiant, team 1 = dire
            const playerTeam = playerPick.team === 0 ? "radiant" : "dire";
            result = match.winner === playerTeam ? "Win" : "Loss";
          }
        }
      } catch (e) {
        console.error("Error parsing additional_info:", e);
      }
      return { ...match, result };
    });

    closeDatabase(db);
    return { success: true, data: processedMatches };
  } catch (error) {
    console.error("Error processing match history:", error);
    closeDatabase(db);
    return { success: false, message: "Failed to fetch match history" };
  }
}
