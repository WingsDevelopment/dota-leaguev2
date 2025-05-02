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

    return data;
  } catch (error) {
    Notify({
      message: `Failed to delete player by discord Id.!", ${error}`,
      type: "error",
    });
    throw error;
  }
};