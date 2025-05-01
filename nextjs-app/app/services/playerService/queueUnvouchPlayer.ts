// File: /app/services/playerService/queueUnvouchPlayer.ts
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
export interface QueueUnvouchParams {
  steam_id: number;
  vouchLevel: number;
}

/**
 * Removes a vouch level from the player's queue_vouches array.
 *
 * @async
 * @function queueUnvouchPlayer
 * @param {QueueUnvouchParams} params - The object containing the player's steam_id and vouch level to remove.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await queueUnvouchPlayer({ steam_id: 12345, vouchLevel: 5 });
 */
export async function queueUnvouchPlayer({ steam_id, vouchLevel }: QueueUnvouchParams) {
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
    let vouches: number[] = JSON.parse(rawJson);

    // Check existence
    if (!vouches.includes(vouchLevel)) {
      throw new Error("Vouch for this queue not assigned to player");
    }

    // Remove and update
    vouches = vouches.filter((v) => v !== vouchLevel);
    await runDbQuery(db, `UPDATE Players SET queue_vouches = ? WHERE steam_id = ?`, [
      JSON.stringify(vouches),
      String(steam_id),
    ]);

    return getSuccessfulServiceResponse({ message: "Player unvouched successfully" });
  } catch (error) {
    return getPrimitiveServiceErrorResponse(error, "Error unvouching player");
  } finally {
    closeDatabase(db);
  }
}
