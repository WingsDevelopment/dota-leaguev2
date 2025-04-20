import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { userReport } from "@/app/services/userReport/createUserReport";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallerCreateReports = async (
  reportPayload: userReport
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.put(
      "/api/report-system/create-report",
      reportPayload
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Failed to create the report!", error);
    throw error;
  }
};
