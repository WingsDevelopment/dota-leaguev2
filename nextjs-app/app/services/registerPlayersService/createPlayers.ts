import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import {
  getPrimitiveServiceErrorResponse,
  getSuccessfulServiceResponse,
  runDbAll,
  runDbQuery,
} from "../common/functions";

/* --------- */
/*   Types   */
/* --------- */
export interface PlayerDataVouch {
  steam_id: number;
  mmr: number;
  name: string | null | undefined;
  discord_id: string | undefined;
}
/**
 * Approves players who registered.
 *
 * @async
 * @function CreatePlayers
 * @param {PlayerDataVouch} params - The object containing the identifiers for creating player into register table.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await CreatePlayers({ steam_id: 123123 , mmr: 1000 , name: "Marko" , discord_id: 123123 });
 */
export async function CreateRegisterPlayers({
  steam_id,
  mmr,
  name,
  discord_id,
}: PlayerDataVouch): Promise<PrimitiveServiceResponse> {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();

  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    if (!steam_id || !mmr || !name || !discord_id) {
      throw new Error("Missing data fields.");
    }
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    await runDbQuery(
      db,
      `INSERT INTO RegisterPlayers (status, steam_id, discord_id, name, mmr) VALUES (?, ?, ?, ?, ?)`,
      ["PENDING", steam_id, discord_id, name, 1000]
    );
    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Player added to RegisterPlayers with status PENDING.",
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(
      error,
      "Error creating player into register table."
    );
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db);
  }
}
