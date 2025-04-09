import axios from "axios";
import {

    getPlayerBySteamId,
  Player,
} from "@/app/services/playerService/getPlayerBySteamId";
import { baseUrl } from "@/app/common/constraints";
import { getPlayerByDiscordId } from "@/app/services/playerService/getPlayerSteamIdByDiscordId";

export const apiCallerGetPlayerSteamIdByDiscordId = async ({
  discordId,
}: getPlayerByDiscordId): Promise<getPlayerBySteamId> => {
  try {
    const response = await axios.get(`${baseUrl}/api/player/get-player-steam-id-by-discord-id`, {
      params: { discordId },
    });

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data[0];
  } catch (error) {
    console.error("Failed to get player by steam Id!", error);
    throw error;
  }
};
