import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { getPlayerByDiscordId } from "@/app/services/playerService/getPlayerSteamIdByDiscordId";
import axios from "axios";

export const apiCallerDeletePlayerBySteamId = async (
    {discordId}:getPlayerByDiscordId
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post("/api/player/delete-by-discord-id", 
        {data: {discordId}}
    );

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    console.error("Failed to delete player by discord Id.!", error);
    throw error;
  }
};