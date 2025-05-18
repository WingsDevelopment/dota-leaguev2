import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { MatchHistory } from "@/app/matchHistory/[id]/page";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerGetMatchHistory = async ({
  params: { steamId }, config
}: { params: { steamId: string }, config: ApiCallerConfig }): Promise<MatchHistory[]> => {
  try {
    const response = await axios.get(`${getBaseUrl(config?.origin)}/api/match-history-players/show-history`, {
      ...config,
      params: { steamId },
    });
    const data = response.data;
    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully fetched match history.`
    );
    return data.data;
  } catch (error) {
    config.onErrorCallback(`Failed to fetch match history! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
