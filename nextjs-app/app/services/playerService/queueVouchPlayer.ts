// File: /app/services/playerService/queueVouchPlayer.ts
import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import {
  getPrimitiveServiceErrorResponse,
  getSuccessfulServiceResponse,
  runDbAll,
  runDbQuery,
} from "../common/functions";

/* ------------- */
/*   Interfaces  */
/* ------------- */
export interface QueueVouchParams {
  steam_id: number;
  vouchLevel: number;
}

/**
 * Adds a vouch level to the player's queue_vouches array.
 *
 * @async
 * @function queueVouchPlayer
 * @param {QueueVouchParams} params - The object containing the player's steam_id and vouch level.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await queueVouchPlayer({ steam_id: 12345, vouchLevel: 5 });
 */
export async function queueVouchPlayer({ steam_id, vouchLevel }: QueueVouchParams) {
  const db = await getDbInstance();
  try {
    // Validation
    if (!steam_id || vouchLevel == null) {
      throw new Error("Missing steam_id or vouchLevel");
    }

    // Fetch existing queue_vouches column only
    const rows = await runDbAll<any>(
      db,
      `SELECT queue_vouches FROM Players WHERE steam_id = ?`,
      [String(steam_id)]
    );
    const rawJson = rows[0]?.queue_vouches ?? "[]";
    const vouches: number[] = JSON.parse(rawJson);

    // Prevent duplicates
    if (vouches.includes(vouchLevel)) {
      throw new Error("Player already has this queue vouch");
    }

    // Append and update
    vouches.push(vouchLevel);
    await runDbQuery(db, `UPDATE Players SET queue_vouches = ? WHERE steam_id = ?`, [
      JSON.stringify(vouches),
      String(steam_id),
    ]);

    return getSuccessfulServiceResponse({ message: "Player vouched successfully" });
  } catch (error) {
    return getPrimitiveServiceErrorResponse(error, "Error vouching player");
  } finally {
    closeDatabase(db);
  }
}
