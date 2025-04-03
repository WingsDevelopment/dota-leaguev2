import { fetcher } from "../../../../lib/fetch";
import { baseUrl } from "../../../common/constraints";
import type { UserReport } from "../../../services/userReport/getUserReports";

export const apiCallerGetReports = async (): Promise<UserReport[]> => {
  const response = await fetcher(`${baseUrl}/api/report-system/get-reports`);
  return response?.data || [];
};
