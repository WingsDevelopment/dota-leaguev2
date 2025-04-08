import axios from "axios";
import {
  getPlayerBySteamId,
  Player,
} from "@/app/services/playerService/getPlayerBySteamId";
import { baseUrl } from "@/app/common/constraints";

export const apiCallerGetPlayerBySteamId = async ({
  steamId,
}: getPlayerBySteamId): Promise<Player> => {
  try {
    const response = await axios.get(`${baseUrl}/api/player/get-player-by-steam-id`, {
      params: { steamId },
    });

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error("Failed to get player by steam Id!", error);
    throw error;
  }
};
