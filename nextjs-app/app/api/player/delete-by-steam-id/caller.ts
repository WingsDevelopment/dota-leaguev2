import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { getPlayerBySteamId } from "@/app/services/playerService/getPlayerBySteamId";
import axios from "axios";

export const apiCallerDeletePlayerBySteamId = async (
    {steamId}:getPlayerBySteamId
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post("/api/player/delete-by-steam-id", 
        {data: {steamId}}
    );

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    console.error("Failed to delete player by steam Id!", error);
    throw error;
  }
};