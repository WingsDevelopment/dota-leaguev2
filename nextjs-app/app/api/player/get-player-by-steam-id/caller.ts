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
    return data.data;
  } catch (error) {
    // Notify({
    //   message: `Failed to get player by steam Id! ${error}`,
    //   type: "error",
    // });
    console.error(`Failed to get player by steam Id!s`, error);
    throw error;
  }
};
