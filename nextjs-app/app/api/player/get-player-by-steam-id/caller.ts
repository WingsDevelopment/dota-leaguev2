import {
  getPlayerBySteamId,
  Player,
} from "@/app/services/playerService/getPlayerBySteamId";
import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/app/lib/notification";
import { axiosWrapper } from "../../../lib/fetch";

export const apiCallerGetPlayerBySteamId = async ({
  steam_id,
}: getPlayerBySteamId): Promise<Player> => {
  try {
    const response = await axiosWrapper.get(
      `${baseUrl}/api/player/get-player-by-steam-id`,
      {
        params: { steam_id },
      }
    );

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    Notify({
      message: `Failed to get player by steam Id! ${error}`,
      type: "error",
    });
    throw error;
  }
};
