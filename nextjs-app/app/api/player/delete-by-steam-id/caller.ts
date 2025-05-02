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

    return data;
  } catch (error) {
    Notify({
      message: `Failed to delete player by steam Id!, ${error}`,
      type: "error",
    });
    throw error;
  }
};
