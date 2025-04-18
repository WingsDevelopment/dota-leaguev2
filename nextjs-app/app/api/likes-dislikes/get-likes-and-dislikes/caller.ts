import axios from "axios";
import {
  getPlayerBySteamId,
  Player,
} from "@/app/services/playerService/getPlayerBySteamId";
import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { SumOfLikesAndDislikes } from "@/app/services/likesAndDislikesService/getLikesAndDislikes";

export const apiCallerGetLikesAndDislikesBySteamId = async ({
  steam_id,
}: getPlayerBySteamId): Promise<SumOfLikesAndDislikes> => {
  try {
    const response = await axios.get(`${baseUrl}/api/likes-dislikes/get-likes-and-dislikes`, {
      params: { steam_id },
    });

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    Notify({
      message: `Failed to get likes and dislikes for requested steam Id! ${error}`,
      type: "error",
    });
    throw error;
  }
};
