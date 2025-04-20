import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { Player } from "../../../services/playerService/getPlayerBySteamId";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallerGetPlayers = async (): Promise<Player[]> => {
  try {
    const response = await axiosWrapper.get(`${baseUrl}/api/player/players-read`);
    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    Notify({
      message: `Failed to fetch the players!, ${error}`,
      type: "error",
    });
    throw error;
  }
};
