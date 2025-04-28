import axios from "axios";
import { baseUrl, getBaseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { MatchHistory } from "@/app/matchHistory/[id]/page";
import { MatchHistoryParams } from "@/app/services/matchHistoryService/getMatchHistory";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerGetMatchHistory = async ({
  steamId, config
}: { steamId: string, config?: ApiCallerConfig }): Promise<MatchHistory[]> => {
  try {
    const response = await axios.get(`${getBaseUrl(config?.origin)}/api/match-history-players/show-history`, {
      params: { steamId, config },
    });

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error(`Failed to get match history!`, error);
    throw error;
  }
};
