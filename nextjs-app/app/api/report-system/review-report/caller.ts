import { axiosWrapper } from "../../../../lib/fetch";
import type { PrimitiveServiceResponse } from "../../../services/common/types";

export const apiCallerReviewReport = async (
  reportId: number
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.put("/api/report-system/review-report", {
      id: reportId,
    });

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    console.error("Failed to solve the report!", error);
    throw error;
  }
};
