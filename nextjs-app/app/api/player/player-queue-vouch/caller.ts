import { Notify } from "@/lib/notification";
import type { QueueVouchParams } from "@/app/services/playerService/queueVouchPlayer";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallerQueueVouchPlayer = async (
  params: QueueVouchParams
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.post("/api/player/player-queue-vouch", params);
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({ message: `Failed to vouch player: ${error}`, type: "error" });
    throw error;
  }
};
