import { getApiServerCallerConfig } from "@/lib/getApiServerCallerConfig";

import axios from "axios";
import { Vouch } from "../../../services/registerPlayersService/readPlayers";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";

export const apiCallerGetPlayers = async ({
  config,
}: {
  config: ApiCallerConfig;
}): Promise<Vouch[]> => {
  try {
    const response = await axios.get(
      `${getBaseUrl(config?.origin)}/api/register-players/register-players-read`,
      config
    );
    const data = response.data;

    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully fetched vouch list.`
    );
    return data.data;
  } catch (error) {
    config.onErrorCallback(`Failed to fetch the vouch list! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
