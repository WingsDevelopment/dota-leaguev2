import { axiosWrapper } from "../../../lib/fetch";
import { baseUrl } from "../../../common/constraints";
import type { UserReport } from "../../../services/userReport/getUserReports";

export const apiCallerGetReports = async (): Promise<UserReport[]> => {
  const response = await axiosWrapper.get(`${baseUrl}/api/report-system/get-reports`);
  return response?.data || [];
};
