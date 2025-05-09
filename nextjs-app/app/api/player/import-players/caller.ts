import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { Leaderboard } from "@/app/services/playerService/importPlayers";
import { Notify } from "@/lib/notification";
import { getBaseUrl } from "@/app/common/constraints";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerImportPlayers = async (
  { params: { leaderboard }, config }: { params: Leaderboard, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
  //Test caller first if its used first time
  try {
    const response = await axios.post(`${getBaseUrl(config?.origin)}/api/player/import-players`, {
      leaderboard
    }, config);

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully imported players.`
    );
    return data;
  } catch (error) {
    config.onErrorCallback(`Failed to import the players! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};