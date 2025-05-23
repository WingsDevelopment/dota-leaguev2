import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { PublicProfile } from "@/app/services/playerService/updateIsPublicProfile";
import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";

export const apiCallerUpdatePlayerProfileVisibility = async (
  { params: { checked, discord_id }, config }: { params: PublicProfile, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post(`${getBaseUrl(config?.origin)}/api/player/update-is-public-profile`,
      { checked, discord_id }, config
    );

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    config.onSuccessCallback(
      `Successfully updated user's profile visibility.`
    );
    return data;
  } catch (error) {
    config.onErrorCallback(`Failed to change user's profile visibility! ${error}`);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
