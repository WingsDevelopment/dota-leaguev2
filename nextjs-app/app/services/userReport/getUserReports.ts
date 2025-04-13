import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { ServiceResponse } from "../common/types";
import {
  getPrimitiveServiceErrorResponse,
  getSuccessfulServiceResponse,
  runDbAll,
} from "../common/functions";
import { ReportType } from "./common/type";

/* --------- */
/*   Types   */
/* --------- */
export enum UserReportReview {
  UNREVIEWED = 0,
  REVIEWED = 1,
}

export type UserReport = {
  id: number;
  reporter_name: string;
  reported_name: string;
  type: string;
  match_id: number;
  report: ReportType;
  reviewed: UserReportReview;
  time: string; // todo Date?
};

/**
 * Retrieves ALL user reports from the database.
 *
 * @async
 * @function getUserReports
 * @returns {Promise<ServiceResponse<UserReport[]>>} A promise that resolves to a service response object.
 *
 * @example
 * // Example usage:
 * const response = await getUserReports();
 */
export async function getUserReports(): Promise<ServiceResponse<UserReport[]>> {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();
  try {
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    const query = `
      SELECT 
        ur.id,
        p1.name AS reporter_name, 
        p2.name AS reported_name, 
        ur.type, 
        ur.match_id, 
        ur.report, 
        ur.reviewed, 
        ur.time
      FROM UserReport ur
      LEFT JOIN Players p1 ON ur.steam_id = p1.steam_id
      LEFT JOIN Players p2 ON ur.other_player_steam_id = p2.steam_id;
    `;
    const reports = await runDbAll<UserReport[]>(db, query);
    console.log(reports)
    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      data: reports,
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(
      error,
      "Error processing user reports"
    );
  } finally {
    /* -------- */
    /*  Done    */
    /* -------- */
    closeDatabase(db);
  }
}
