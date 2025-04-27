import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { ServiceResponse } from "../common/types";
import {
  getPrimitiveServiceErrorResponse,
  getSuccessfulServiceResponse,
  runDbAll,
} from "../common/functions";

export type VouchStatus = "PENDING" | "APPROVED" | "DECLINED";

export interface Vouch {
  id: number;
  status: VouchStatus;
  steam_id: number;
  name: string;
  discord_id: number;
  mmr: number;
}
/**
 * Approves players who registered.
 *
 * @async
 * @function ReadPlayers
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await DeletePlayers({ steam_id: "123123" });
 */
export async function getRegisterPlayers(): Promise<ServiceResponse<Vouch[]>> {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();
  try {
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    const registerPlayers: any = await runDbAll(db, `SELECT * FROM RegisterPlayers`, []);
    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      data: registerPlayers,
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(
      error,
      "Error getting data from Register Table."
    );
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db);
  }
}
