import { PrimitiveServiceResponse } from "@/app/services/common/types";
import axios from "axios";
import { RegisterPlayers } from "@/app/services/registerPlayersService/approvePlayers";
import { getBaseUrl, isUserAdmin } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallersetDeclinePlayers = async ({
  params: { registrationId, requestType }, config

}: { params: RegisterPlayers, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post(
      `${getBaseUrl(config?.origin)}/api/register-players/register-players-decline`,
      { registrationId, requestType }, config
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({
      message: `Failed to decline the player! ${error}`,
      type: "error",
    });
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
