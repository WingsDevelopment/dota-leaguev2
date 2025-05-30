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
  user_steam_id?: string | null;
  other_player_steam_id: string;
  type: ReportType;
  report: string;
  match_id?: number | null;
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
  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    if (!Object.values(ReportType).includes(type as ReportType)) {
      throw new Error("Invalid report type.");
    }
    if (!user_steam_id || !other_player_steam_id || !type || !report) {
      throw new Error("Missing required fields.");
    }

    if (report.length > 512) {
      throw new Error("Report text exceeds 512 characters.");
    }
    if (match_id !== undefined && match_id !== null && (isNaN(match_id) || typeof match_id !== "number")) {
      throw new Error("Match ID must be a valid number.");
    }
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
