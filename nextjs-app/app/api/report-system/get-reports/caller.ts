import axios, { AxiosRequestConfig } from "axios";
import type { UserReport } from "../../../services/userReport/getUserReports";
import { baseUrl, getBaseUrl } from "../../../common/constraints";

export type Origin = "server" | "client" | undefined;
export interface ApiCallerConfig extends AxiosRequestConfig<any> {
  origin?: Origin; // if not specified it will be treated as "server"
}

export const apiCallerGetReports = async ({
  config,
}: {
  config?: ApiCallerConfig;
}): Promise<UserReport[]> => {
  console.log({ config });
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
