import axios from "axios";
import { baseUrl, getBaseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerGetPlayers = async ({
  config,
}: {
  config: ApiCallerConfig;
}): Promise<Player[]> => {
  try {
    const response = await axios.get(`${getBaseUrl(config?.origin)}/api/player/players-read`,
      config);
    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error(`Failed to fetch players`, error);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
