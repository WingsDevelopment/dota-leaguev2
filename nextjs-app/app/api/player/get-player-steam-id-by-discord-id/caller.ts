import axios from "axios";
import {

  getPlayerBySteamId,
  Player,
} from "@/app/services/playerService/getPlayerBySteamId";
import { baseUrl, getBaseUrl } from "@/app/common/constraints";
import { getPlayerByDiscordId } from "@/app/services/playerService/getPlayerSteamIdByDiscordId";
import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerGetPlayerSteamIdByDiscordId = async (
  { params: { discordId }, config }:
    { params: getPlayerByDiscordId, config: ApiCallerConfig }): Promise<getPlayerBySteamId> => {
  try {
    const response = await axios.get(`${getBaseUrl(config?.origin)}/api/player/get-player-steam-id-by-discord-id`,
      {
        ...config,
        params: { discordId }
      }
    );

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    Notify({
      message: `Failed to get player by steam Id!, ${error}`,
      type: "error",
    });
    throw error;
  }
};
