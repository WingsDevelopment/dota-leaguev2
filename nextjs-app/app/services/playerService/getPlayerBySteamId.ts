import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import {
  getPrimitiveServiceErrorResponse,
  getSuccessfulServiceResponse,
  runDbAll,
} from "../common/functions";
import { ServiceResponse } from "../common/types";
/* --------- */
/*   Types   */
/* --------- */
export interface getPlayerBySteamId {
  steam_id: string | null;
}
export interface Player {
  id: number;
  discord_id: number;
  steam_id: number;
  name: string;
  mmr: number;
  captain: number;
  banned_until: string;
  games_didnt_show: number;
  games_left: number;
  games_griefed: number;
  bbb: number;
  is_public_profile: boolean;
  wins: number | null;
  loses: number | null;
  streak: number | null;
  vouched_date: string | null;
  queue_vouches?: string[];
}
/**
 * Gets the player data by steam Id.
 *
 * @async
 * @function getPlayerBySteamId
 * @param {getPlayerBySteamId} params - The object containing the steam ID identifier.
 * @returns {Promise<ServiceResponse<Player | undefined>>} A promise that resolves to a service response which wraps player/undefined .
 *
 * @example
 * const response = await getPlayerBySteamId({ steamId: 12345 });
 */
export async function getPlayerBySteamId({
  steam_id,
}: getPlayerBySteamId): Promise<ServiceResponse<Player | undefined>> {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();
  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    if (!steam_id) {
      throw new Error("Missing required field: steam_id");
    }
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    const players = await runDbAll<Player[]>(
      db,
      `SELECT * FROM Players WHERE steam_id = ?`,
      [steam_id]
    );
    /* ------------------*/
    /*   Console Data    */
    /* ----------------- */
    if (players.length > 1) {
      console.log("There is more than two players");
    }
    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Fetched player data by steam id successfully.",
      data: players[0],
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(error, "Error finding player.");
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db);
  }
}
