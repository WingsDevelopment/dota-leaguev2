import axios from "axios";
import { Notify } from "../../../../lib/notification";
import { PrimitiveServiceResponse } from "../../../services/common/types";
import { QueueUnvouchParams } from "../../../services/playerService/queueUnvouchPlayer";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerQueueUnvouchPlayer = async (
  { params, config }: { params: QueueUnvouchParams, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post("/api/player/player-queue-unvouch", params, config);
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({ message: `Failed to unvouch player: ${error}`, type: "error" });
    throw error;
  }
};
