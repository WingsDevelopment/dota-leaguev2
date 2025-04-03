import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { PrimitiveServiceResponse } from "../common/types";
import {
  getPrimitiveServiceErrorResponse,
  getSuccessfulServiceResponse,
  runDbQuery,
} from "../common/functions";

/* --------- */
/*   Types   */
/* --------- */
interface ReviewReports {
  id: string;
}

/**
 * Marks a user report as reviewed in the database.
 *
 * @async
 * @function ReviewUserReport
 * @param {ReviewReports} params - The object containing the report identifier.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await setReviewUserReport({ id: "123" });
 */
export async function setReviewUserReport({
  id,
}: ReviewReports): Promise<PrimitiveServiceResponse> {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();
  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    const idNumber = Number(id);
    if (isNaN(idNumber)) throw new Error("Invalid report id");

    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    await runDbQuery(db, `UPDATE UserReport SET reviewed = 1 WHERE id = ?`, [
      id,
    ]);

    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Report successfully reviewed",
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(error, "Error updating the review");
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db);
  }
}
