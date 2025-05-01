import axios, { AxiosRequestConfig } from "axios";
import type { UserReport } from "../../../services/userReport/getUserReports";
import { getBaseUrl } from "../../../common/constraints";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerGetReports = async ({
  config,
}: {
  config?: ApiCallerConfig;
}): Promise<UserReport[]> => {
  try {
    const response = await axios.get(
      `${getBaseUrl(config?.origin)}/api/report-system/get-reports`,
      config
    );
    const data = response.data;

    if (!data.success) throw new Error(data.message);

    return data.data;
  } catch (error) {
    console.error(`Failed to fetch players`, error);
    throw error;
  }
};
