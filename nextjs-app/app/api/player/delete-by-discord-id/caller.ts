import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { getPlayerByDiscordId } from "@/app/services/playerService/getPlayerSteamIdByDiscordId";
import { Notify } from "@/lib/notification";
import axios from "axios";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";

export const apiCallerDeletePlayerBySteamId = async (
  { params: { discordId }, config }: { params: getPlayerByDiscordId, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
  try {
    //Needs testing when implemented
    const response = await axios.post(`${getBaseUrl(config?.origin)}/api/player/delete-by-discord-id`,
      { params: { discordId } }, config
    );

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully deleted player by discord id.`
    );
    return data;
  } catch (error) {
    config.onErrorCallback(`Failed to delete player by discord id! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};