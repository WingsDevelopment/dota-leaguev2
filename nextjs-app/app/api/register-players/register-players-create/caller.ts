import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { PlayerDataVouch } from "@/app/services/registerPlayersService/createPlayers";
import axios from "axios";
import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";
interface PlayerDataFromInput {
  steam_id: number;
  mmr: number;
}
export const apiCallerCreatePlayers = async ({
  params: { steam_id, mmr }, config

}: { params: PlayerDataFromInput, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.put(
      `${getBaseUrl(config?.origin)}/api/register-players/register-players-create`,
      { steam_id, mmr }, config
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({
      message: `Failed to vouch the player! ${error}`,
      type: "error",
    });
    throw error;
  }
};
