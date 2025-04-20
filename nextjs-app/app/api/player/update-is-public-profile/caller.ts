import axiosWrapper from "axiosWrapper";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { PublicProfile } from "@/app/services/playerService/updateIsPublicProfile";
import { Notify } from "@/lib/notification";

export const apiCallerUpdatePlayerProfileVisibility = async ({
  checked,
  discord_id,
}: PublicProfile): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.post("/api/player/update-is-public-profile", {
      checked,
      discord_id,
    });

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    Notify({
      message: `Failed to change user profile visibility!, ${error}`,
      type: "error",
    });
    throw error;
  }
};
