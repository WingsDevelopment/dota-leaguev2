import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { getBaseUrl } from "@/app/common/constraints";
import { ApiCallerConfig } from "../../common/interfaces";
import { Notify } from "@/lib/notification";

export const apiCallerReviewReport = async ({
  params: { reportId }, config
}: { params: { reportId: number }, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.put(`${getBaseUrl(config?.origin)}/api/report-system/review-report`,
      { id: reportId }, config
    );

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    Notify({
      message: `Failed to solve the report! ${error}`,
      type: "error",
    });
    throw error;
  }
};
