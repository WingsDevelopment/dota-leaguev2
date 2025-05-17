import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { DeletePlayer } from "@/app/services/registerPlayersService/deletePlayers";
import axios from "axios";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";
import { headers } from "next/headers";
import { Notify } from "@/lib/notification";

export const apiCallerDeletePlayers = async ({
  params: { steam_id }, config
}: { params: { steam_id: DeletePlayer }, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
  // Needs to be tested when DELETE is implemented on front.
  try {
    const response = await axios.delete(`${getBaseUrl(config?.origin)}/api/register-players/register-players-delete`,
      {
        ...config,
        params: { steam_id },
      }
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully deleted player from vouch list.`
    );

    return data;
  } catch (error) {
    config.onErrorCallback(`Failed to delete the player! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
