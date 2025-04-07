import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { PublicProfile } from "@/app/services/playerService/updateIsPublicProfile";

export const apiCallerUpdatePlayerProfileVisibility = async (
    {checked, discord_id}:PublicProfile
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post("/api/player/update-is-public-profile", {
        checked, discord_id
    });

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    console.error("Failed to change user profile visibility!", error);
    throw error;
  }
};
