import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbQuery } from "../common/functions";
/* ------------- */
/*   Interfaces  */
/* ------------- */
export interface UnanParams {
  steam_id: number;
}

/**
 * Bans player by bantype and steamId.
 *
 * @async
 * @function UnbanPlayer
 * @param {UnanParams} params - The object containing identifiers for the ban.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await banPlayer({ steam_id: 12345, banType:"bbb" });
 */
export async function UnbanPlayer({
  steam_id
}: UnanParams) {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();
  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    if (!steam_id) {
      throw new Error("Missing player steam id.");
    }
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    await runDbQuery(
      db,
      `UPDATE Players SET banned_until = NULL WHERE steam_id = ?`,
      [steam_id]
    );
    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Player ban status updated successfully"
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(error, "Error deleting player by discord ID.");
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db)
  }
}
