import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { getPlayerBySteamId } from "@/app/services/playerService/getPlayerBySteamId";
import { Notify } from "@/lib/notification";
import axios from "axios";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";

export const apiCallerDeletePlayerBySteamId = async (
  { params: { steam_id }, config }: { params: getPlayerBySteamId, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
  //Needs test when implemented
  try {
    const response = await axios.post(`${getBaseUrl(config?.origin)}/api/player/delete-by-steam-id`,
      { params: { steam_id } }, config
    );

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully deleted player by steam id.`
    );
    return data;
  } catch (error) {
    config.onErrorCallback(`Failed to delete player by steam id! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
