import axios from "axios";
import { Notify } from "@/lib/notification";
import type { QueueVouchParams } from "@/app/services/playerService/queueVouchPlayer";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";

export const apiCallerQueueVouchPlayer = async (
  { params, config }: { params: QueueVouchParams, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post(`${getBaseUrl(config?.origin)}/api/player/player-queue-vouch`,
      params, config);
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({ message: `Failed to vouch player: ${error}`, type: "error" });
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
