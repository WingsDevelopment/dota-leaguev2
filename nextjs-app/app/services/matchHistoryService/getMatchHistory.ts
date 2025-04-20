import { getDbInstance } from "../../../db/utils";
import { closeDatabase } from "../../../db/initDatabase";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll } from "../common/functions";
import { ServiceResponse } from "../common/types";
/* --------- */
/*   Types   */
/* --------- */
export type MatchResult = "Win" | "Loss";
export interface MatchHistory {
  id: number;
  match_id: number;
  league_id: number;
  start_time: number;
  duration: number;
  game_mode: string;
  lobby_type: string;
  region: string;
  winner: "radiant" | "dire";
  radiant_score: number;
  dire_score: number;
  additional_info: string;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  items: string;
  result?: MatchResult; // "Win" or "Loss" calculated from API
}

export interface MatchHistoryParams {
  steamId?: string | null;
}
/**
 * Returns match history for the user by steam Id..
 *
 * @async
 * @function getMatchHistory
 * @param {MatchHistoryParams} params - The object containing the steam id.
 * @returns {Promise<ServiceResponse<MatchHistory[] | undefined>>} A promise that resolves to a service response which return MatchHistory or undefined.
 *
 * @example
 * const response = await getMatchHistory({ steamId: "123" });
 */
export async function getMatchHistory({
  steamId
}: MatchHistoryParams): Promise<ServiceResponse<MatchHistory[] | undefined>> {
  /* ----------------- */
  /*   Initialization  */
  /* ----------------- */
  const db = await getDbInstance();

  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    if (!steamId) {
      throw new Error("Missing steam_id parameter");
    }
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    const matchHistory = await runDbAll<MatchHistory[]>(db, `SELECT 
            mh.id, mh.match_id, mh.league_id, mh.start_time, mh.duration, mh.game_mode, 
            mh.lobby_type, mh.region, mh.winner, mh.radiant_score, mh.dire_score, mh.additional_info,
            mps.hero_id, mps.kills, mps.deaths, mps.assists, mps.items
         FROM MatchHistory mh
         JOIN MatchPlayerStats mps ON mh.id = mps.match_history_id
         WHERE mps.steam_id = ?
         ORDER BY mh.start_time DESC`, [
      steamId
    ]);

    // Process each match to add a win/loss result from the player's perspective
    const processedMatches = matchHistory.map((match) => {
      let result: MatchResult | undefined = undefined
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
        throw new Error("Error parsing additional_info.");
      }
      return { ...match, result };
    });
    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Fetched match history successfully.",
      data: processedMatches
    });

  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(error, "Error finding match history.");
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db)
  }
}
