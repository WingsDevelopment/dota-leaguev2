import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";
import { PrimitiveServiceResponse } from "../common/types";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbQuery } from "../common/functions";
import { ReportType } from "./common/type";


/* --------- */
/*   Types   */
/* --------- */

export interface userReport {
  user_steam_id: number;
  other_player_steam_id: number;
  type: ReportType;
  report: string;
  match_id: number;
}

/**
 * Creates user report in the database.
 *
 * @async
 * @function createUserReport
 * @param {userReport} params - The object containing the report identifiers.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await setReviewUserReport({ id: "123" });
 */
export async function createUserReport({
  user_steam_id,
  other_player_steam_id,
  type,
  report,
  match_id,
}: userReport): Promise<PrimitiveServiceResponse> {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();
  /* ------------- */
  /*   Validation  */
  /* ------------- */
  if (!Object.values(ReportType).includes(type as ReportType)) {
    throw new Error("Invalid report type.");
  }

  try {
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    await runDbQuery(db, `INSERT INTO UserReport (steam_id, other_player_steam_id, type, report, match_id) VALUES (?, ?, ?, ?, ?)`, [
      user_steam_id, other_player_steam_id, type, report, match_id,
    ]);
    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Report successfully inserted.",
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(error, "Error inserting the review.");
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db)
  }
}
