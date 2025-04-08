import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { Leaderboard } from "@/app/services/playerService/importPlayers";
import { getPlayerBySteamId } from "@/app/services/playerService/getPlayerBySteamId";
import { baseUrl } from "@/app/common/constraints";
import { Player } from "@/components/admin/player-crud";

export const apiCallerGetPlayerBySteamId = async (
    {steamId}:getPlayerBySteamId
): Promise<Player> => {
  try {
    const response = await axios.get(`${baseUrl}/api/player/get-player-by-steam-id`, {
        params:{steamId}
    });

    const data = response.data
    if (!data.success) throw new Error(data.message);
    console.log(data,'data')
    return data.data;
  } catch (error) {
    console.error("Failed to get player by steam Id!", error);
    throw error;
  }
};