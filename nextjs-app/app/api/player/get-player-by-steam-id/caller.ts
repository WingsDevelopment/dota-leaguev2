import axios from "axios";
import {
  getPlayerBySteamId,
  Player,
} from "@/app/services/playerService/getPlayerBySteamId";
import { baseUrl, getBaseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerGetPlayerBySteamId = async ({
  params: { steam_id }, config
}: { params: getPlayerBySteamId, config: ApiCallerConfig }): Promise<Player> => {
  try {
    const response = await axios.get(`${getBaseUrl(config?.origin)}/api/player/get-player-by-steam-id`, {
      ...config,
      params: { steam_id }
    });

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully fetched player by steam id.`
    );
    return data.data;
  } catch (error) {
    config.onErrorCallback(`Failed to get player by steam id! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
